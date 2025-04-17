import { NextResponse } from 'next/server'
import { TSiteContext } from '@/types/site.context'
import { IChatbotContext } from '@/types/data.types';
import { unbody } from '@/lib/unbody/unbody.clients';

export async function POST(req: Request) {
  try {
    const context = await req.json();
    console.log("context", context)

    const { data: {payload: {content}} } = await unbody.generate.text(
      `Generate a short summary describing a knoweldge-base build with the data of a website. 
      your summary must be short and concise (max 15 words)
       """
       Website data:
       ${JSON.stringify(context.website)}
       """
       Pages data:
       ${JSON.stringify(context.pages)}
       """
       Template: My knowledge-base is about [website-name] that is about [website-description].
       `,
    )
    return NextResponse.json({ summary: content })
  } catch (error) {
    console.error('Error in setup/config/knowledge-summary:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 