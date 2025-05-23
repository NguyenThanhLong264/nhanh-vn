export async function GET() {
    const condition = {
        CareSoftDomain: process.env.CARESOFT_DOMAIN,
        CareSoftApi: process.env.CARESOFT_API,
        GGSheetApi: process.env.GOOGLE_SHEETS_API_KEY
    }
    return Response.json(condition)
}