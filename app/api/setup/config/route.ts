// import { createChatbotContext, getConfigs, getContext } from "@/lib/unbody/unbody.services"
// import { NextResponse } from "next/server"

// export const GET = async (request: Request) => {
//   try{
//     const configs = await getConfigs();
//     return NextResponse.json(configs)
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json({ error: "Failed to get configs" }, { status: 500 })
//   }
// }