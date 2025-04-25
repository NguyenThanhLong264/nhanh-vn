import axios from 'axios';
import { NextResponse } from 'next/server';
import { saveOrderDealMapping } from '../../lib/db';
import condition from '../../data/condition.json'

export async function sendToExternalApi(dealData, body) {
  const token = condition.token;
  const data = body.data
  const orderId = data.orderId
  const businessId = body.businessId
  try {
    console.log("sendToExternalApi - Deal data:", dealData);

    const axiosConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/deal`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
      },
      data: JSON.stringify({ deal: dealData }),
    };

    const web2Response = await axios.request(axiosConfig);
    console.log('sendToExternalApi - Web 2 response:', JSON.stringify(web2Response.data));

    const dealId = web2Response.data.deal?.id;
    const appid = condition.NhanhVN_AppId;

    if (orderId && dealId && businessId && appid) {
      await saveOrderDealMapping(orderId.toString(), dealId.toString(), businessId.toString(), appid);
      console.log(`sendToExternalApi - Saved mapping: order_id=${orderId}, deal_id=${dealId}, business_id=${businessId}, appid=${appid}`);
    } else {
      console.error('sendToExternalApi - Missing fields for mapping:', { orderId, dealId, businessId, appid });
    }

    return {
      status: 200,
      data: web2Response.data,
    };
  } catch (error) {
    console.error('sendToExternalApi - Error:', error.message);
    console.error('sendToExternalApi - Error details:', error.response?.data);

    return {
      status: 500,
      error: error.message,
      details: error.response?.data,
    };
  }
}
