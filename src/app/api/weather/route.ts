import { NextResponse } from "next/server";

// Yongsan-gu, Seoul (approximate YISS campus coords)
const LAT = 37.5326;
const LON = 126.9905;

export const revalidate = 600;

export async function GET() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=Asia%2FSeoul&forecast_days=3`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const raw = await res.json();

    const now = new Date();
    const hourly: { time: string; t: number; code: number }[] = [];
    const times: string[] = raw.hourly?.time ?? [];
    const temps: number[] = raw.hourly?.temperature_2m ?? [];
    const codes: number[] = raw.hourly?.weather_code ?? [];

    let startIdx = times.findIndex((t) => new Date(t).getTime() >= now.getTime());
    if (startIdx < 0) startIdx = 0;
    for (let i = startIdx; i < startIdx + 6 && i < times.length; i++) {
      hourly.push({ time: times[i], t: temps[i], code: codes[i] });
    }

    const daily: { date: string; max: number; min: number; code: number }[] = [];
    const dTimes: string[] = raw.daily?.time ?? [];
    const dMax: number[] = raw.daily?.temperature_2m_max ?? [];
    const dMin: number[] = raw.daily?.temperature_2m_min ?? [];
    const dCode: number[] = raw.daily?.weather_code ?? [];
    for (let i = 0; i < dTimes.length; i++) {
      daily.push({ date: dTimes[i], max: dMax[i], min: dMin[i], code: dCode[i] });
    }

    return NextResponse.json({
      current: {
        t: raw.current?.temperature_2m ?? 0,
        feels: raw.current?.apparent_temperature ?? 0,
        humidity: raw.current?.relative_humidity_2m ?? 0,
        wind: raw.current?.wind_speed_10m ?? 0,
        code: raw.current?.weather_code ?? 0,
        isDay: !!raw.current?.is_day,
      },
      hourly,
      daily,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "weather_unavailable", detail: String(e) },
      { status: 502 },
    );
  }
}
