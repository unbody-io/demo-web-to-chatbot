import { NextResponse } from 'next/server'
import { unbodyAdmin } from "@/lib/unbody/unbody.clients";
import { SourceTypes } from "unbody/admin/entities";
import { 
  StreamEventMessageType, 
  StreamEventTypes_Setup_Create as StreamEventTypes,
} from '@/types/api.types';
import { createChatbotContext } from '@/lib/unbody/unbody.services';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  // lets fake the process to test the stream and UI

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // const _encoder = new TextEncoder();
  // const _stream = new ReadableStream({
  //   async start(controller) {

  //     const sendStatus = (status: StreamEventTypes, message: StreamEventMessageType, payload: any = {}) => {
  //       controller.enqueue(_encoder.encode(`data: ${JSON.stringify({ status, message, payload })}\n\n`));
  //     }

  //     sendStatus(StreamEventTypes.Init, StreamEventMessageType.Processing)

  //     await sleep(1000)
  //     sendStatus(StreamEventTypes.Init, StreamEventMessageType.Done)
  //     await sleep(1000)
  //     sendStatus(StreamEventTypes.Crawling, StreamEventMessageType.Processing)
  //     await sleep(3000)
  //     sendStatus(StreamEventTypes.Crawling, StreamEventMessageType.Done)
  //     await sleep(1000)
  //     sendStatus(StreamEventTypes.Indexing, StreamEventMessageType.Processing)
  //     await sleep(3000)
  //     sendStatus(StreamEventTypes.Indexing, StreamEventMessageType.Done)
  //     await sleep(1000)
  //     sendStatus(StreamEventTypes.Context, StreamEventMessageType.Processing)
  //     await sleep(3000)
  //     sendStatus(StreamEventTypes.Context, StreamEventMessageType.Done)
  //     await sleep(1000)
  //     sendStatus(StreamEventTypes.Finished, StreamEventMessageType.Done)
  //     controller.close();
  //   }
  // });

  // return new Response(_stream, {
  //   headers: {
  //     'Content-Type': 'text/event-stream',
  //     'Cache-Control': 'no-cache',
  //     'Connection': 'keep-alive',
  //   },
  // });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {

      const sendStatus = (status: StreamEventTypes, message: StreamEventMessageType, payload: any = {}) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status, message, payload })}\n\n`));
      }

      const project = await unbodyAdmin.projects.get({
        id: process.env.UNBODY_PROJECT_ID as string,
      });
    
      if (!project) {
        sendStatus(StreamEventTypes.Error, StreamEventMessageType.Error, { message: "Project not found" })
        controller.close();
        return;
      }

      try {
        sendStatus(StreamEventTypes.Init, StreamEventMessageType.Processing)
        // Delete existing web crawler sources
        const existingSources = await project.sources.list({
          filter: {
            type: SourceTypes.WebCrawler
          }
        })

        if (existingSources.sources.length > 0) {
          for (const source of existingSources.sources) {
            await project.sources.delete({ id: source.id })
          }
        }

        // Create new crawler
        const crawler = await project.sources.ref({
          name: "Web Crawler",
          type: SourceTypes.WebCrawler
        }).save();

        await crawler.setEntrypoint({
          entrypoint: {
            url: url,
            maxDepth: 2,
            maxPages: 15,
            jsEnabled: true,
          }
        })

        await crawler.initialize();
        sendStatus(StreamEventTypes.Init, StreamEventMessageType.Done)

        // this is last step of the setup
        const handleContext = async () => {
          try{
            sendStatus(StreamEventTypes.Context, StreamEventMessageType.Processing)
            await createChatbotContext()
            sendStatus(StreamEventTypes.Context, StreamEventMessageType.Done)
            await sleep(200)
            sendStatus(StreamEventTypes.Finished, StreamEventMessageType.Done)
            await sleep(200)
            controller.close();
          }catch(error: any){
            sendStatus(StreamEventTypes.Error, StreamEventMessageType.Error, { message: error.message })
            controller.close();
          }
        }
        
        const interval = setInterval(async () => {
          const { jobs: [job] } = await crawler.listJobs({});

          const indexingStarted = (
            job.processedCount > 0 
            || job.failedCount > 0
            || job.queuedCount > 0
            || job.processingCount > 0            
          )

          const isCrawlingStarted = (
            job.status === "running" 
            && !indexingStarted
          )

          const isCrawlingFinished = indexingStarted;
          const isIndexingFinished = job.status === "finished";

          if(isIndexingFinished){
            // dispatch final event to the client
            sendStatus(StreamEventTypes.Indexing, StreamEventMessageType.Done)
            clearInterval(interval);
            await sleep(250)
            await handleContext();
          }else{
            if(indexingStarted){
              sendStatus(StreamEventTypes.Indexing, StreamEventMessageType.Processing)
              await sleep(1000)
            }
            if(isCrawlingStarted){
              sendStatus(StreamEventTypes.Crawling, StreamEventMessageType.Processing)
            }else if(isCrawlingFinished){
              sendStatus(StreamEventTypes.Crawling, StreamEventMessageType.Done)
            }
          }
        }, 5000);

      } catch (error: any) {
        console.error("Error in setup/create:", error);
        sendStatus(StreamEventTypes.Error, StreamEventMessageType.Error, { message: error.message })
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
