import { useState } from "react";
import { PageContainer } from "@/lib/components/layout/PageContainer/PageContainer";
import { AppNavbar, type ViewKey } from "./components/AppNavbar";
import { HomeView } from "./views/HomeView";
import { VocabularyView } from "./views/VocabularyView";
import { SpeechView } from "./views/SpeechView";

export function App() {
  const [view, setView] = useState<ViewKey>("home");

  return (
    <PageContainer maxWidth="fluid" background="surface" padding="none">
      <div className="flex min-h-screen flex-col px-4 sm:px-6 lg:px-8">
        <AppNavbar active={view} onChange={setView} />
        <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col pb-8">
          {view === "home" && <HomeView onSelect={setView} />}
          {view === "vocabulary" && <VocabularyView />}
          {view === "speech" && <SpeechView />}
        </main>
        <footer className="py-6 text-center text-[13px] text-[var(--color-text-tertiary)]">
          © 2026 CQ Institution Inc.
        </footer>
      </div>
    </PageContainer>
  );
}
