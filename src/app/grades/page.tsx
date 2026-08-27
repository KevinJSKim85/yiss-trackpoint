import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Grades — YISS TrackPoint",
};

export default function GradesPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-start justify-center gap-3 px-5 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold">
        GRADES
      </p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Grades
      </h1>
      <p className="text-sm text-ink-muted">
        Coming soon — this tab is being wired up. Head back to the Overview
        for now.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Back to Overview
      </Link>
    </section>
  );
}
