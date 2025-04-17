import { UnderstandingOutput } from '@/lib/unbody/rag-pipeline/agents/rag-pipeline.agent.query-parser';
import { GenerationOutput, IRagMessage, RetrievalOutput, ValuationOutput } from '@/lib/unbody/rag-pipeline/rag-pipeline.types';
import { useState, useCallback, useRef } from 'react';

export enum ERagStage {
  Status = 'status',
  Understanding = 'understanding',
  Retrieval = 'retrieval',
  Generation = 'generation',
  Valuation = 'valuation',
  Final = 'final',
  Error = 'error',
}

export interface IRagStageStatus {
  key: ERagStage;
  status: 'loading' | 'done' | 'error';
  error?: string;
}

export interface IRagState {
  [ERagStage.Status]: IRagStageStatus;
  [ERagStage.Understanding]: IRagStageStatus;
  [ERagStage.Retrieval]: IRagStageStatus;
  [ERagStage.Generation]: IRagStageStatus;
  [ERagStage.Valuation]: IRagStageStatus;
  [ERagStage.Final]: IRagStageStatus;
  [ERagStage.Error]: IRagStageStatus;
}

export interface RagState {
  stage: IRagState;
  progress: number;
  output: {
    understanding?: UnderstandingOutput;
    retrieval?: RetrievalOutput;
    generation?: GenerationOutput;
    valuation?: ValuationOutput;
  };
  error?: string;
}

export interface UseAgenticRagOptions {
  onComplete?: (output: RagState['output']) => void;
  onError?: (error: string) => void;
  onStageChange?: (stage: ERagStage) => void;
}

interface StreamData {
  stage: ERagStage | 'start' | 'status';
  output?: any;
  error?: string;
  message?: string;
}

const initialStages: IRagState = {
  [ERagStage.Status]:      { key: ERagStage.Status,      status: 'loading', error: undefined },
  [ERagStage.Understanding]:{ key: ERagStage.Understanding,status: 'loading', error: undefined },
  [ERagStage.Retrieval]:   { key: ERagStage.Retrieval,   status: 'loading', error: undefined },
  [ERagStage.Generation]:  { key: ERagStage.Generation,  status: 'loading', error: undefined },
  [ERagStage.Valuation]:   { key: ERagStage.Valuation,   status: 'loading', error: undefined },
  [ERagStage.Final]:       { key: ERagStage.Final,       status: 'loading', error: undefined },
  [ERagStage.Error]:       { key: ERagStage.Error,       status: 'loading', error: undefined },
};

const validateStreamData = (data: any): data is StreamData => {
  return typeof data === 'object' && data !== null && typeof data.stage === 'string';
};

export function useAgenticRag(
  options: UseAgenticRagOptions = {},
  payload: Record<string, any>
) {
  const [state, setState] = useState<RagState>({
    stage: { ...initialStages },
    progress: 0,
    output: {},
  });

  const [history, setHistory] = useState<IRagMessage[]>([]);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isIdle, setIsIdle] = useState(true);
  const updateStage = useCallback((stage: ERagStage) => {
    setState(prev => ({
      ...prev,
      stage: {
        ...prev.stage,
        [stage]: { key: stage, status: 'loading', error: undefined }
      }
    }));
    options.onStageChange?.(stage);
  }, [options.onStageChange]);

  const updateStageStatus = useCallback((stage: ERagStage, status: 'loading' | 'done' | 'error') => {
    setState(prev => ({
      ...prev,
      stage: {
        ...prev.stage,
        [stage]: { key: stage, status, error: undefined }
      }
    }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const updateOutput = useCallback((key: keyof RagState['output'], value: any) => {
    setState(prev => ({ ...prev, output: { ...prev.output, [key]: value } }));
  }, []);

  const handleError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      stage: {
        ...prev.stage,
        [ERagStage.Error]: { key: ERagStage.Error, status: 'error', error }
      }
    }));
    options.onError?.(error);
  }, [options.onError]);

  const addToHistory = useCallback((message: IRagMessage) => {
    setHistory(prev => [...prev, message]);
  }, []);

  const query = useCallback(async (query: string) => {
    // Reset all stages, progress, and output
    setState(prev => ({ ...prev, stage: { ...initialStages }, progress: 0, output: {} }));

    // Add user message to history
    const userMessage: IRagMessage = { role: 'user', content: query, timestamp: Date.now() };
    addToHistory(userMessage);

    // Abort previous
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    setIsIdle(false);
    try {
      const assistantMessage: IRagMessage = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        query: undefined,
        payload: undefined,
      }
      addToHistory(assistantMessage);

      setConnectionState('connecting');
      const response = await fetch('/api/rag-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history, ...payload }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start processing');
      }

      setConnectionState('connected');
      updateStageStatus(ERagStage.Status, 'done');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setConnectionState('idle');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n');
          const eventType = lines[0].replace('event: ', '');
          const data = JSON.parse(lines[1].replace('data: ', ''));

          switch (eventType) {
            case 'status':
              console.log('Status:', data.message);
              break;

            case ERagStage.Understanding:
              updateOutput('understanding', data.output);
              updateStage(ERagStage.Understanding);
              updateStageStatus(ERagStage.Understanding, 'done');
              updateProgress(25);
              setHistory(prev => {
                const lastMessage = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...lastMessage, query: data.output as UnderstandingOutput }];
              });
              break;

            case ERagStage.Retrieval:
              updateOutput('retrieval', data.output);
              updateStage(ERagStage.Retrieval);
              updateStageStatus(ERagStage.Retrieval, 'done');
              updateProgress(50);
              setHistory(prev => {
                const lastMessage = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...lastMessage, payload: data.output.results as RetrievalOutput["results"] }];
              });
              break;

            case ERagStage.Generation:
              const { answer, followups = [] } = data.output;
              updateOutput('generation', { answer, followUps: followups });
              updateStage(ERagStage.Generation);
              updateStageStatus(ERagStage.Generation, 'done');
              updateProgress(75);
              setHistory(prev => {
                const lastMessage = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...lastMessage, content: answer, role: "assistant" }];
              });
              break;

            case ERagStage.Valuation:
              console.log("Valuation:", data.output)  
              updateOutput('valuation', data.output);
              updateStage(ERagStage.Valuation);
              updateStageStatus(ERagStage.Valuation, 'done');
              updateProgress(90);
              break;

            case ERagStage.Final:
              setIsIdle(true);
              setState(prev => {
                const next = {
                  ...prev,
                  stage: {
                    [ERagStage.Status]: { key: ERagStage.Status, status: 'done' as const },
                    [ERagStage.Understanding]: { key: ERagStage.Understanding, status: 'done' as const },
                    [ERagStage.Retrieval]: { key: ERagStage.Retrieval, status: 'done' as const },
                    [ERagStage.Generation]: { key: ERagStage.Generation, status: 'done' as const },
                    [ERagStage.Valuation]: { key: ERagStage.Valuation, status: 'done' as const },
                    [ERagStage.Final]: { key: ERagStage.Final, status: 'done' as const },
                    [ERagStage.Error]: { key: ERagStage.Error, status: 'done' as const }
                  },
                  progress: 100
                };
                options.onComplete?.(next.output);
                return next;
              });
              break;

            case 'error':
              handleError(data.message);
              setIsIdle(true);
              break;

            default:
              console.warn(`Unknown event: ${eventType}`);
          }
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setConnectionState('error');
        handleError(`Failed to process query: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      abortControllerRef.current = null;
    }
  // dependencies ensure we always get fresh history & options
  }, [addToHistory, history, payload, updateStage, updateStageStatus, updateProgress, updateOutput, handleError, options.onComplete]);



  console.log("state", isIdle)

  return {
    state,
    query,
    history,
    connectionState,
    isIdle,
    isProcessing: !isIdle,
    isComplete: state.stage[ERagStage.Final].status === 'done',
    isError: state.stage[ERagStage.Error].status === 'error',
    progress: state.progress,
  };
}
