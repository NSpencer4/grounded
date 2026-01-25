import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Custom hook for Server-Sent Events (SSE)
 * Connects to the Gateway API's SSE endpoint for real-time updates
 */

interface UseSSEOptions {
  onMessage?: (data: unknown) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  autoReconnect?: boolean
  reconnectInterval?: number
}

export function useSSE(url: string | null, options: UseSSEOptions = {}) {
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    reconnectInterval = 3000,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<unknown>(null)
  const [error, setError] = useState<Event | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldReconnectRef = useRef(autoReconnect)

  const connect = useCallback(() => {
    if (!url) return

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('SSE connection opened')
        setIsConnected(true)
        setError(null)
        onOpen?.()
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          onMessage?.(data)
        } catch (err) {
          console.error('Error parsing SSE message:', err)
        }
      }

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err)
        setIsConnected(false)
        setError(err)
        onError?.(err)

        // Auto-reconnect if enabled
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect SSE...')
            connect()
          }, reconnectInterval)
        }
      }
    } catch (err) {
      console.error('Error creating SSE connection:', err)
    }
  }, [url, onMessage, onError, onOpen, reconnectInterval])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    onClose?.()
  }, [onClose])

  const reconnect = useCallback(() => {
    disconnect()
    shouldReconnectRef.current = true
    connect()
  }, [connect, disconnect])

  useEffect(() => {
    if (url) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [url, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    error,
    reconnect,
    disconnect,
  }
}

/**
 * Hook specifically for conversation updates via SSE
 */
export function useConversationSSE(conversationId: string | null) {
  const sseUrl = conversationId
    ? `${import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8787'}/sse/${conversationId}`
    : null

  const [messages, setMessages] = useState<unknown[]>([])

  const handleMessage = useCallback((data: unknown) => {
    // Handle different types of updates
    if (data && typeof data === 'object') {
      const update = data as { type?: string; payload?: unknown }
      
      if (update.type === 'message') {
        setMessages((prev) => [...prev, update.payload])
      } else if (update.type === 'status_change') {
        // Handle status changes
        console.log('Conversation status changed:', update.payload)
      }
    }
  }, [])

  const sse = useSSE(sseUrl, {
    onMessage: handleMessage,
    onError: (error) => {
      console.error('Conversation SSE error:', error)
    },
  })

  return {
    ...sse,
    messages,
    clearMessages: () => setMessages([]),
  }
}
