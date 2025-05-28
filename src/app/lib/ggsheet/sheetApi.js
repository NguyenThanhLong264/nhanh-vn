export async function getFullsheet(spreadId) {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const range = 'Sheet1!A1:Z';
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadId}/values/${range}?key=${apiKey}`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google Sheets API error: ${errorData.error.message}`);
        }
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        throw error;
    }
}

export async function createObjects(values, headers) {
    const headerNames = headers.map(h => h.name);
    const rows = values.slice(1);
    const objects = rows.map(row =>
        Object.fromEntries(
            headerNames.map((key, i) => [key, row[i] || ''])
        )
    );

    return objects;
}