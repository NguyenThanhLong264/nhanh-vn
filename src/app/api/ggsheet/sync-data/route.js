// nhanh-vn/src/app/api/ggsheet/sync-data/route.js
import { createObjects, getFullsheet } from '@/app/lib/ggsheet/sheetApi';
import { ggsheetCreateDeal, ggsheetMapDeal } from '@/app/lib/ggsheet/dealhandle';

export async function POST(request) {
  try {
    const { config, sheetFields, spreadId } = await request.json();
    const sheetResponse = await getFullsheet(spreadId);
    const objects = await createObjects(sheetResponse);

    const createdDeals = [];
    for (const item of objects) {
      const dealData = await ggsheetMapDeal(item, config);
      const result = await ggsheetCreateDeal(dealData, sheetFields);
      createdDeals.push(result);
    }

    return Response.json({
      success: true,
      createdDeals: createdDeals
    });
  } catch (error) {
    console.error("Error syncing data:", error);
    return Response.json(
      { error: "Failed to sync data" },
      { status: 500 }
    );
  }
}
