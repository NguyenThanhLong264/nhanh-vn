export async function createConditionObj(spreadId) {
    return {
        CareSoftDomain: process.env.CARESOFT_DOMAIN,
        CareSoftApi: process.env.CARESOFT_API,
        GGSheetApi: process.env.GOOGLE_SHEETS_API_KEY,
        GGSheetSpreadsheetId: spreadId
    }
}