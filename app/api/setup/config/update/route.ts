import { NextRequest, NextResponse } from 'next/server'
import { IChatbotConfigs, IChatbotContext } from '@/types/data.types';
import { extractPromptParamsFromRawPersona, getConfigs, updateConfigs } from '@/lib/unbody/unbody.services';

type RequestBody = {
  configs: IChatbotConfigs
}

export async function GET(
  req: NextRequest,
  res: NextResponse<IChatbotConfigs>,
) {
  try {
    return NextResponse.json({
      configs: await getConfigs()
    })
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  res: NextResponse<IChatbotConfigs>,
) {
  try {
    const {configs} = await req.json() as RequestBody;
    console.log("configs received in update route", configs)

    const currentConfigs = await getConfigs();
    let newConfigs = configs;
  
    if(currentConfigs?.personaPrompt !== configs.personaPrompt) {
      const newParameters = await extractPromptParamsFromRawPersona(configs.personaPrompt)
      newConfigs = {
        ...configs,
        ...newParameters
      }
    }

    await updateConfigs(newConfigs)
    return NextResponse.json({configs: newConfigs})
  } catch (error) {
    console.error('Error in setup/config/update:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
