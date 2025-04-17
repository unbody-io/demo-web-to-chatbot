import { StreamEventData } from '@/types/api.types'
import { useState, useEffect } from 'react'

interface UseEventStreamOptions {
  body?: Record<string, any>
}

interface UseEventStreamResult<M extends string, P extends Record<string, any>> {
  data: StreamEventData<M, P> | null
  error: Error | null
}

export function useEventStream<M extends string, P extends Record<string, any>>(
  url: string | null,
  options: UseEventStreamOptions = {}
): UseEventStreamResult<M, P> {
  const [data, setData] = useState<StreamEventData<M, P> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return

    // Convert body to query parameters
    const queryParams = new URLSearchParams()
    if (options.body) {
      Object.entries(options.body).forEach(([key, value]) => {
        queryParams.append(key, value)
      })
    }

    const fullUrl = `${url}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const eventSource = new EventSource(fullUrl)

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data)
        setData(parsedData)
      } catch (e) {
        console.error('Error parsing event data:', e)
      }
    }

    eventSource.onerror = (error) => {
      // Check if the connection was closed normally
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('EventSource connection closed normally')
        return
      }
    
      console.log('EventSource error:', error)
      setError(new Error('EventSource connection failed'))
      eventSource.close()
    }

    // Cleanup function
    return () => {
      eventSource.close()
    }
  }, [url, options.body])

  return { data, error }
} 