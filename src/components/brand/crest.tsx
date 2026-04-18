import { cn } from "@/lib/utils";

export function YissCrest({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="YISS Guardian crest"
    >
      <defs>
        <linearGradient id="crest-ink" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--ink)" />
          <stop offset="1" stopColor="var(--ink-soft)" />
        </linearGradient>
        <linearGradient id="crest-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--gold-soft)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M32 2 L58 12 V30 C58 46 46 56 32 62 C18 56 6 46 6 30 V12 Z"
        fill="url(#crest-ink)"
        stroke="var(--gold)"
        strokeWidth="1.2"
      />
      <path
        d="M32 8 L52 16 V30 C52 42 43 50 32 55 C21 50 12 42 12 30 V16 Z"
        fill="none"
        stroke="url(#crest-gold)"
        strokeWidth="0.6"
        opacity="0.65"
      />
      <g transform="translate(32 34)" fill="url(#crest-gold)">
        <path d="M-10 -10 L-5 -14 L0 -10 L5 -14 L10 -10 L8 2 L0 8 L-8 2 Z" opacity="0.95" />
        <circle r="2.2" fill="var(--ink)" />
      </g>
      <text
        x="32"
        y="22"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="7"
        fontWeight="700"
        letterSpacing="0.14em"
        fill="var(--gold-soft)"
      >
        YISS
      </text>
    </svg>
  );
}

export function YissWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">
        YISS
      </span>
      <span className="h-4 w-px bg-[color:var(--line-strong)]" aria-hidden />
      <span className="font-display text-[1.1rem] italic text-ink-soft tracking-tight">
        TrackPoint
      </span>
    </div>
  );
}
