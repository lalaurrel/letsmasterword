/**
 * 단어장 문서에서 텍스트 추출 — .txt / .hwpx / .hwp 지원.
 * 추출한 평문은 parse.ts(parseText)가 단어/뜻으로 처리한다.
 *
 *  - .txt  : 그대로 읽음
 *  - .hwpx : 압축(zip) + XML → 문단별 텍스트 추출 (안정적)
 *  - .hwp  : 구 바이너리(OLE) → 섹션 압축 해제 + 레코드 파싱 (best-effort)
 */
import { unzipSync, inflateSync, strFromU8 } from "fflate";
import * as CFB from "cfb";

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

/** 추출 결과가 의미 있는 텍스트인지(빈 값/깨진 바이너리 방지). */
function looksValid(text: string): boolean {
  const t = text.trim();
  if (t.length < 1) return false;
  const printable = t.replace(/[^\p{L}\p{N}\s.,:;'"\-–—()[\]/]/gu, "");
  return printable.length >= t.length * 0.5;
}

// ───────── .hwpx ─────────
function fromHwpx(buf: Uint8Array): string {
  const files = unzipSync(buf);
  const sections = Object.keys(files)
    .filter((n) => /Contents\/section\d+\.xml$/i.test(n))
    .sort();
  let out = "";
  for (const name of sections) {
    const xml = strFromU8(files[name]);
    const paras = xml.match(/<hp:p\b[\s\S]*?<\/hp:p>/gi) ?? [];
    for (const p of paras) {
      const text = decodeXmlEntities(p.replace(/<[^>]+>/g, ""))
        .replace(/[ \t]+/g, " ")
        .trim();
      if (text) out += text + "\n";
    }
  }
  return out;
}

// ───────── .hwp (구 바이너리) ─────────
const HWP_EXT_CTRL = new Set([1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23]);
const HWP_INLINE_CTRL = new Set([4, 5, 6, 7, 8, 9, 19, 20]);

/** PARA_TEXT 레코드(UTF-16LE + 제어문자)에서 글자만 추출. */
function decodeHwpParaText(data: Uint8Array): string {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const n = Math.floor(data.byteLength / 2);
  let out = "";
  for (let i = 0; i < n; ) {
    const c = dv.getUint16(i * 2, true);
    if (c < 32) {
      // 확장/인라인 제어문자는 8 워드(16바이트) 차지, 나머지는 1 워드
      i += HWP_EXT_CTRL.has(c) || HWP_INLINE_CTRL.has(c) ? 8 : 1;
    } else {
      out += String.fromCharCode(c);
      i += 1;
    }
  }
  return out;
}

function toU8(content: unknown): Uint8Array {
  if (content instanceof Uint8Array) return content;
  if (Array.isArray(content)) return new Uint8Array(content as number[]);
  return new Uint8Array(0);
}

/** HWP 섹션 스트림(레코드 묶음)을 파싱해 문단 텍스트 추출. */
function parseHwpSection(bytes: Uint8Array): string {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 0;
  let out = "";
  while (pos + 4 <= bytes.byteLength) {
    const header = dv.getUint32(pos, true);
    pos += 4;
    const tagId = header & 0x3ff;
    let size = (header >> 20) & 0xfff;
    if (size === 0xfff) {
      if (pos + 4 > bytes.byteLength) break;
      size = dv.getUint32(pos, true);
      pos += 4;
    }
    const data = bytes.subarray(pos, pos + size);
    pos += size;
    if (tagId === 66) out += "\n"; // PARA_HEADER → 새 문단
    else if (tagId === 67) out += decodeHwpParaText(data); // PARA_TEXT
  }
  return out;
}

function fromHwp(buf: Uint8Array): string {
  const container = CFB.read(buf, { type: "buffer" });

  // 압축 여부: FileHeader의 flags(offset 36) bit0
  let compressed = true;
  const fhIdx = container.FullPaths.findIndex((p) => /FileHeader$/i.test(p));
  if (fhIdx >= 0) {
    const fh = toU8(container.FileIndex[fhIdx].content);
    if (fh.byteLength >= 40) {
      const flags = new DataView(fh.buffer, fh.byteOffset, fh.byteLength).getUint32(36, true);
      compressed = (flags & 0x01) !== 0;
    }
  }

  // BodyText/SectionN 스트림을 번호순으로
  const sections = container.FullPaths
    .map((path, idx) => ({ path, idx }))
    .filter(({ path }) => /BodyText\/Section\d+$/i.test(path))
    .sort((a, b) => {
      const na = Number(a.path.match(/Section(\d+)$/i)?.[1] ?? 0);
      const nb = Number(b.path.match(/Section(\d+)$/i)?.[1] ?? 0);
      return na - nb;
    });

  let out = "";
  for (const { idx } of sections) {
    const raw = toU8(container.FileIndex[idx].content);
    const data = compressed ? inflateSync(raw) : raw;
    out += parseHwpSection(data) + "\n";
  }
  return out;
}

/** 파일에서 단어장 평문 텍스트를 추출. 실패 시 throw. */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".hwpx")) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const text = fromHwpx(buf);
    if (!looksValid(text)) throw new Error("hwpx empty");
    return text;
  }

  if (name.endsWith(".hwp")) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const text = fromHwp(buf);
    if (!looksValid(text)) throw new Error("hwp empty");
    return text;
  }

  // .txt 및 기타 평문
  return await file.text();
}
