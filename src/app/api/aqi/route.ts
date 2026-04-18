import { NextResponse } from "next/server";

const LAT = 37.5326;
const LON = 126.9905;

export const revalidate = 900;

export async function GET() {
  try {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
      `&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide` +
      `&timezone=Asia%2FSeoul`;

    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error(`Open-Meteo AQ ${res.status}`);
    const raw = await res.json();

    return NextResponse.json({
      aqi: Math.round(raw.current?.us_aqi ?? 0),
      pm25: raw.current?.pm2_5 ?? 0,
      pm10: raw.current?.pm10 ?? 0,
      o3: raw.current?.ozone ?? 0,
      no2: raw.current?.nitrogen_dioxide ?? 0,
      updated: raw.current?.time ?? new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "aqi_unavailable", detail: String(e) },
      { status: 502 },
    );
  }
}
