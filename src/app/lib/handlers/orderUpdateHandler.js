import { mapToDealFormat } from './commonOrderUtils.js';
import { createCSdeal } from '../services/createCSdeal.js';
import { getDealIdByOrderId } from '../../lib/db.js'
import { fetchFullOrderData } from '../services/fetchOrderNhanh.js'

export async function handleOrderUpdate(body) {
  console.log('Handling orderUpdate');
  const data = body.data;
  const dealId = await getDealIdByOrderId(data.orderId);
  let fetchOrderData;
  let response;
  if (!dealId) {
    fetchOrderData = fetchFullOrderData(data.orderId)
    console.log('handleOrderUpdate - fetchOrderData', fetchOrderData);

    const dealData = await mapToDealFormat(fetchOrderData); // Xử lý dữ liệu
    response = await createCSdeal(dealData);
  } else {

  }
  return {
    status: response.status,
    data: response.data
  };
}
