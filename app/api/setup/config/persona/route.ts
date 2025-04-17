import { NextResponse } from 'next/server'
import { generatePersona } from '@/lib/unbody/unbody.services'
import { IPersonaPrompt } from '@/types/data.types';

export async function POST(
  req: Request,
  res: NextResponse<IPersonaPrompt>
) {
  try {
    const {context, history} = await req.json();
    return NextResponse.json(await generatePersona(context, history));
  } catch (error) {
    console.error('Error in setup/config/persona:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 