import { NextRequest, NextResponse } from 'next/server'
import { IChatbotContext } from '@/types/data.types';
import { getContext } from '@/lib/unbody/unbody.services';


export async function GET(
  req: NextRequest,
  res: NextResponse<{context: IChatbotContext}>,
) {
  try {
    const context = await getContext()
    console.log('context', context)
  
    return NextResponse.json({
      context
    })
    
  } catch (error) {
    console.error('Error in setup/config/context:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 