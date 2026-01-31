import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.CDEK_TOKEN; // токен, который дают для API
  const cityCode = '270'; // пример кода города, можно сделать динамически

  const res = await fetch(`https://api.cdek.ru/v2/deliverypoints?cityid=${cityCode}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  return NextResponse.json(data);
}
