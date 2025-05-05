import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const data = await request.json();
        const configPath = path.join(process.cwd(), 'src', 'app', 'test', 'newConfig.json');
        
        await writeFile(configPath, JSON.stringify(data, null, 2), 'utf8');
        
        return NextResponse.json({ message: 'Configuration saved successfully' });
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json(
            { error: 'Failed to save configuration' }, 
            { status: 500 }
        );
    }
}