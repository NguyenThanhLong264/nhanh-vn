import { createObjects, getFullsheet } from "@/app/lib/ggsheet/sheetApi"

export async function POST(req) {
    const body = await req.json()
    const { spreadsheetId, headers } = body

    const rawData = await getFullsheet(spreadsheetId)
    const data = await createObjects(rawData, headers)

    return Response.json({
        total: data.length,
        objs: data
    })
}