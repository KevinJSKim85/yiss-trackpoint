"use client";

import { useState } from "react";
import { DashboardHeader } from "./header";
import { DashboardGrid } from "./grid";

export function DashboardShell() {
  const [editMode, setEditMode] = useState(false);
  return (
    <>
      <DashboardHeader
        editMode={editMode}
        onToggleEdit={() => setEditMode((v) => !v)}
        onResetLayout={() => {
          (window as unknown as { __yissReset?: () => void }).__yissReset?.();
        }}
      />
      <main className="flex-1">
        <DashboardGrid editMode={editMode} />
      </main>
      <footer className="mx-auto w-full max-w-[1400px] px-5 pb-8 md:px-8">
        <div className="divider mb-4" />
        <div className="flex flex-col items-start justify-between gap-2 text-[11px] text-ink-muted md:flex-row md:items-center">
          <p>
            <span className="font-display italic">YISS TrackPoint</span> · a
            student-made launchpad for Guardians.
          </p>
          <p className="font-mono uppercase tracking-[0.18em]">
            Truth · Excellence · Diversity
          </p>
        </div>
      </footer>
    </>
  );
}
