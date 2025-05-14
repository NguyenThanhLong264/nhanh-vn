// nhanh-vn/src/app/api/ggsheet/sync-data/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { config, sheetFields } = await request.json();

    // 1. Gọi Google Sheets API nội bộ với thông tin từ config
    const sheetResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ggsheet/fetch-ggsheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, sheetFields })
    });
    const sheetData = await sheetResponse.json();

    // 2. Áp dụng mapping rules
    const transformedData = transformData(sheetData);

    // 3. Gửi đến web khác
    const webResponse = await fetch('https://api.web-khac.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedData)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Hàm transform data
function transformData(data) {
  // Logic mapping của bạn ở đây
  return data;
}