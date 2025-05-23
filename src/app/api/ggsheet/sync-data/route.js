// nhanh-vn/src/app/api/ggsheet/sync-data/route.js
import { createObjects, getFullsheet } from '@/app/lib/ggsheet/sheetApi';
import { ggsheetCreateDeal, ggsheetMapDeal } from '@/app/lib/ggsheet/dealhandle';

export async function POST(request) {
  try {
    const { config, sheetFields, spreadId } = await request.json();
    console.log("CONFIG", config);

    const sheetResponse = await getFullsheet(spreadId);
    const objects = await createObjects(sheetResponse);

    // Process each object and create deals
    const dealPromises = objects.map(async (item) => {
      const dealData = await ggsheetMapDeal(item, config);
      return await ggsheetCreateDeal(dealData, sheetFields);
    });

    const results = await Promise.all(dealPromises);

    return Response.json({
      success: true,
      createdDeals: results.length
    });
  } catch (error) {
    console.error("Error syncing data:", error);
    return Response.json(
      { error: "Failed to sync data" },
      { status: 500 }
    );
  }
}