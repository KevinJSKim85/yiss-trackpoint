import type { Metadata } from "next";

import { DashboardHeader } from "@/components/dashboard/header";
import { ClubsDirectory } from "@/components/pages/clubs-directory";

export const metadata: Metadata = {
  title: "Clubs — YISS TrackPoint",
  description:
    "Directory of student clubs and activities at Yongsan International School of Seoul.",
};

export default function ClubsPage() {
  return (
    <>
      <DashboardHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-[1400px] px-5 pt-6 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            CLUBS
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink md:text-4xl">
            Clubs Directory
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Find a club, browse by category, and reach out to the sponsors.
          </p>
        </section>
        <ClubsDirectory />
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
