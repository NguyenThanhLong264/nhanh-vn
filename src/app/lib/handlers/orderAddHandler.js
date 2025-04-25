import { mapToDealFormat } from './commonOrderUtils.js';
import { sendToExternalApi } from '../services/externalApi';

export async function handleOrderAdd(body) {
  console.log('Handling orderAdd');

  const dealData = mapToDealFormat(body.data); // Xử lý dữ liệu

  // Gửi dữ liệu đã xử lý tới API bên ngoài
  const response = await sendToExternalApi(dealData);

  return {
    status: response.status,
    data: response.data
  };
}
