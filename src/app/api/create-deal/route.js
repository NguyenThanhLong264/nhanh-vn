import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const mappedData = await request.json();

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.caresoft.vn/thammydemo/api/v1/deal',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer Pd_jJlPnlLPhQXE'
      },
      data: mappedData
    };

    const response = await axios.request(config);
    
    return NextResponse.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
