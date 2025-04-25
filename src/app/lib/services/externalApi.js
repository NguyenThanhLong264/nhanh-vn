import axios from 'axios';

export async function sendToExternalApi(dealData) {
  const apiUrl = process.env.EXTERNAL_API_URL;

  try {
    const response = await axios.post(apiUrl, dealData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response;
  } catch (error) {
    console.error('Error sending to external API:', error);
    throw error;
  }
}
