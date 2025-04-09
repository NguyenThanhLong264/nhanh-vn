import axios from 'axios';

export async function POST() {
  try {
    const formData = {
      version: '2.0',
      appId: '75230',
      businessId: '203978',
      accessToken: 'EBYEaUSVcXfHdtgeGCmSZT2NzP2IKlQvEOQgD0wj9Hd7xqvZ9d9Sl8OjCmezGq9TUVxGpM7DfeobyZCDvojKsCESA1PpbuSkkm3YpLv37AwILPQn3bM4mZuMsSxykAcDYN072MxOgL5ZiWNcFPqlcW435XgMHK7SF7B8DcuelJquDtNGhoJSzt8ZJS1IupMO4FweBtT4XaOODYHjGj6k2viJ6fhR0d725oXlI',
      data: '{"page":1}'
    };

    const config = {
      method: 'post',
      url: 'https://open.nhanh.vn/api/order/index',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams(formData).toString()
    };

    const response = await axios.request(config);
    return Response.json(response.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}