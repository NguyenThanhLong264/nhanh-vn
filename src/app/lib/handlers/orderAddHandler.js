// lib/handlers/orderAddHandler.js
import { mapToDealFormat } from './commonOrderUtils.js';
import { sendToExternalApi } from '../services/externalApi';

export async function handleOrderAdd(body) {
  console.log('Handling orderAdd');
  console.log('handleOrderAdd - body', body);

  const dealData = await mapToDealFormat(body.data); // Xử lý dữ liệu
  // console.log('handleOrderAdd - dealData:', dealData);

  // Gửi dữ liệu đã xử lý tới API bên ngoài
  const response = await sendToExternalApi(dealData, body);
  return {
    status: response.status,
    data: response.data
  };
}
