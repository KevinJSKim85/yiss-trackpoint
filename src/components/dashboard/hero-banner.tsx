"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Leaf,
  Sun,
  CloudSun,
  Wind,
} from "lucide-react";

type WeatherPayload = {
  current: {
    t: number;
    feels: number;
    humidity: number;
    wind: number;
    code: number;
    isDay: boolean;
  };
  hourly: { time: string; t: number; code: number }[];
  daily: { date: string; max: number; min: number; code: number }[];
};

type AqiPayload = {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  updated: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function weatherIcon(code: number, className = "h-10 w-10") {
  if ([0, 1].includes(code)) return <Sun className={className} />;
  if ([2].includes(code)) return <CloudSun className={className} />;
  if ([3, 45, 48].includes(code)) return <Cloud className={className} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return <CloudRain className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return <CloudSnow className={className} />;
  return <Cloud className={className} />;
}

function weatherLabel(code: number) {
  if ([0].includes(code)) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if ([3].includes(code)) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Showers";
  return "Cloudy";
}

function aqiBand(aqi: number) {
  if (aqi <= 50) return { label: "Good", hex: "#9ec58f", fg: "#0b1e3f" };
  if (aqi <= 100) return { label: "Moderate", hex: "#e3c87c", fg: "#3a2a00" };
  if (aqi <= 150)
    return { label: "Unhealthy for SG", hex: "#e09a52", fg: "#2a1300" };
  if (aqi <= 200) return { label: "Unhealthy", hex: "#e06a6a", fg: "#2a0000" };
  if (aqi <= 300)
    return { label: "Very Unhealthy", hex: "#b06cbb", fg: "#220027" };
  return { label: "Hazardous", hex: "#8a4a6c", fg: "#1a0010" };
}

export function HeroBanner({
  greetingName = "Guardians",
}: {
  greetingName?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const iv = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(iv);
  }, []);

  const { data: weather } = useSWR<WeatherPayload>("/api/weather", fetcher, {
    refreshInterval: 1000 * 60 * 15,
  });
  const { data: aqi } = useSWR<AqiPayload>("/api/aqi", fetcher, {
    refreshInterval: 1000 * 60 * 20,
  });

  const hour = now?.getHours() ?? 8;
  const greeting =
    hour < 5
      ? "Still up"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

  const weekday = now
    ? new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now)
    : "";
  const dateLine = now
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
        .format(now)
        .toUpperCase()
    : "";
  const timeLine = now
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(now)
    : "";

  const aqiInfo = aqi ? aqiBand(aqi.aqi) : null;
  const today = weather?.daily?.[0];

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pt-4 md:px-8">
      <div className="relative overflow-hidden rounded-[18px] border border-[color:var(--line)] shadow-[var(--shadow-md)]">
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr]">
          {/* Left: campus hero */}
          <div className="relative isolate flex min-h-[170px] flex-col justify-between overflow-hidden px-5 py-4 md:min-h-[210px] md:px-8 md:py-5">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-cover bg-center"
              style={{ backgroundImage: "url('/yiss-campus.jpg')" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(100deg, rgba(11,30,63,0.92) 0%, rgba(11,30,63,0.72) 55%, rgba(11,30,63,0.38) 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 -z-10 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--gold) 40%, var(--gold-soft) 60%, transparent)",
                opacity: 0.7,
              }}
            />

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e3c87c]">
              <span>
                {greeting}, {greetingName.toUpperCase()}
              </span>
            </div>

            <div className="mt-2 md:mt-3">
              <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[0.95] tracking-tight text-[#f4efe3] drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                {weekday.toUpperCase() || " "}
              </h1>
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#f4efe3]/85 md:text-xs">
                {dateLine}
                {timeLine && (
                  <>
                    <span className="mx-2 text-[#e3c87c]/70">·</span>
                    <span className="tabular-nums">{timeLine} KST</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: weather + AQI merged */}
          <div className="relative flex flex-col gap-2.5 overflow-hidden bg-[#0b1e3f] px-5 py-4 text-[#f4efe3] md:px-6 md:py-5">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "radial-gradient(600px 300px at 100% 0%, rgba(184,146,58,0.6), transparent 55%)",
              }}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e3c87c]">
                  Yongsan · Now
                </p>
                {weather ? (
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-none tabular-nums">
                      {Math.round(weather.current.t)}
                    </span>
                    <span className="font-display text-lg text-[#f4efe3]/70">
                      °C
                    </span>
                    <span className="ml-2 text-xs font-medium text-[#f4efe3]/80">
                      {weatherLabel(weather.current.code)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 h-10 w-32 animate-pulse rounded bg-white/10" />
                )}
              </div>
              <div className="text-[#e3c87c]">
                {weather ? (
                  weatherIcon(weather.current.code, "h-10 w-10 md:h-11 md:w-11")
                ) : (
                  <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
                )}
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-1.5">
              <Stat
                label="Feels"
                value={
                  weather ? `${Math.round(weather.current.feels)}°` : "—"
                }
              />
              <Stat
                label="Wind"
                value={
                  weather ? (
                    <span className="inline-flex items-baseline gap-1">
                      {Math.round(weather.current.wind)}
                      <span className="text-[10px] font-normal text-[#f4efe3]/60">
                        km/h
                      </span>
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <Stat
                label="H / L"
                value={
                  today
                    ? `${Math.round(today.max)}°/${Math.round(today.min)}°`
                    : "—"
                }
              />
            </div>

            <div
              className="relative flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
              aria-label="Air quality"
            >
              <div
                className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
                style={{
                  background: aqiInfo?.hex ?? "rgba(255,255,255,0.1)",
                  color: aqiInfo?.fg ?? "#f4efe3",
                }}
              >
                <Leaf className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f4efe3]/60">
                    AQI
                  </span>
                  {aqi && (
                    <span className="font-display text-base font-semibold leading-none tabular-nums text-[#f4efe3]">
                      {aqi.aqi}
                    </span>
                  )}
                  {aqi && (
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: aqiInfo?.hex }}
                    >
                      {aqiInfo?.label}
                    </span>
                  )}
                </div>
                {aqi && (
                  <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, (aqi.aqi / 300) * 100)}%`,
                        background:
                          "linear-gradient(90deg,#9ec58f,#e3c87c 33%,#e06a6a 66%,#8a4a6c)",
                      }}
                    />
                  </div>
                )}
              </div>
              {aqi && (
                <div className="hidden flex-none text-right text-[9px] font-medium uppercase tracking-wider text-[#f4efe3]/55 sm:block">
                  PM2.5 {Math.round(aqi.pm25)}
                  <br />
                  PM10 {Math.round(aqi.pm10)}
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#f4efe3]/40">
              <span className="inline-flex items-center gap-1">
                <Wind className="h-2.5 w-2.5" />
                Open-Meteo
              </span>
              <span>US EPA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e3c87c]/85">
        {label}
      </p>
      <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-[#f4efe3]">
        {value}
      </p>
    </div>
  );
}
