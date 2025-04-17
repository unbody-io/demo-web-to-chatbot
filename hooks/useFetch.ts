import { useEffect, useState } from "react"

export const useFetchGET = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<any>(null)

  const fetchData = async (signal: AbortSignal) => {
    try {
      const response = await fetch(url, { signal })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    const abortController = new AbortController()
    setLoading(true)
    fetchData(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [url])

  const execute = async () => {
    if (!url) return
    setLoading(true)
    const abortController = new AbortController()
    await fetchData(abortController.signal)
  }

  return { data, loading, error, execute }
}



export const useFetchPOST = <T>(url: string | null, body: any) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(null)

  const execute = async (_body: any) => {
    // Allow overriding url and body through the execute call
    const requestUrl = _body?.url || url;
    const requestBody = _body?.body || _body || body;
    
    if (!requestUrl) return;
    
    setLoading(true)
    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()  
      setData(data)
      setError(null)
      return data
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }
  
  // Remove the automatic execution when body changes
  // useEffect(() => {
  //   if (body) {
  //     execute(body)
  //   }
  // }, [body])

  return { data, loading, error, execute }
}
