import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const body = await request.json();

        const filePath = path.join(process.cwd(), 'src/app/data/conditionFormData.json');
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf8');

        return new Response(JSON.stringify({ message: 'Saved successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error saving data:', error);
        return new Response(JSON.stringify({ error: 'Failed to save' }), {
            status: 500,
        });
    }
}
