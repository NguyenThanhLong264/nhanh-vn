export async function POST(req) {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY
    try {
        const body = await req.json();
        const spreadsheetId = body.spreadsheetId?.trim();
        if (!spreadsheetId) {
            return Response.json(
                { error: "Spreadsheet ID is required" },
                { status: 400 }
            );
        }

        const range = 'Sheet1!1:1';

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Sheets API error details:', errorData);
            throw new Error(`Google Sheets API error: ${response.status}`);
        }

        const data = await response.json();
        const firstRow = data.values?.[0] || [];

        // Xử lý dữ liệu đầu ra thành array object
        const result = firstRow.map(item => ({
            name: item
        }));

        return Response.json(result);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        return Response.json(
            { error: 'Failed to fetch data from Google Sheets' },
            { status: 500 }
        );
    }
}