import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const { mapping: newMapping, inputTypes: newInputTypes } = await request.json();
  const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');

  try {
    let currentConfig = { mapping: {}, inputTypes: {} };
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      currentConfig = JSON.parse(configData);
    } catch (error) {
      console.log('Save config - No existing config found, creating new one');
    }

    const config = {
      mapping: { ...currentConfig.mapping, ...newMapping },
      inputTypes: { ...currentConfig.inputTypes, ...newInputTypes },
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return NextResponse.json({ message: 'Config saved' }, { status: 200 });
  } catch (error) {
    console.error('Save config error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

export async function GET() {
  const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');
  try {
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.log('Get config - No config found, returning default');
    return NextResponse.json({ mapping: {}, inputTypes: {} }, { status: 200 });
  }
}