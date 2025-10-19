'use client'

import { useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'
import { Mic, MicOff, Loader2 } from 'lucide-react'

type AssistantState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

export default function VoiceAssistant() {
  const [state, setState] = useState<AssistantState>('idle')
  const [isCallActive, setIsCallActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string>('')
  const vapiRef = useRef<Vapi | null>(null)

  useEffect(() => {
    // Initialize Vapi
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

    if (!publicKey) {
      setError('Vapi public key not configured')
      return
    }

    vapiRef.current = new Vapi(publicKey)

    // Event: Call started
    vapiRef.current.on('call-start', () => {
      console.log('📞 Call started')
      setIsCallActive(true)
      setState('listening')
      setError('')
    })

    // Event: Call ended
    vapiRef.current.on('call-end', () => {
      console.log('📞 Call ended')
      setIsCallActive(false)
      setState('idle')
    })

    // Event: Speech start (both user and assistant)
    vapiRef.current.on('speech-start', () => {
      console.log('🎤 Speech started')
      // Don't change state here as we need to determine if it's user or assistant
    })

    // Event: Speech end (both user and assistant)
    vapiRef.current.on('speech-end', () => {
      console.log('🤐 Speech ended')
      // Don't change state here as we need to determine if it's user or assistant
    })

    // Event: Transcript messages (for detecting assistant speech)
    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage: Message = {
          role: message.role,
          text: message.transcript,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, newMessage])

        // Update state based on who is speaking
        if (message.role === 'assistant') {
          setState('speaking')
        } else if (message.role === 'user') {
          setState('thinking')
        }
      }
    })

    // Event: Error
    vapiRef.current.on('error', (error: any) => {
      console.error('❌ Vapi error:', error)
      setError(error.message || 'An error occurred')
      setState('idle')
      setIsCallActive(false)
    })

    // Cleanup
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  const startCall = async () => {
    try {
      setState('connecting')
      setError('')

      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

      if (!assistantId) {
        throw new Error('Assistant ID not configured')
      }

      await vapiRef.current?.start(assistantId)
    } catch (err) {
      console.error('Failed to start call:', err)
      setError(err instanceof Error ? err.message : 'Failed to start call')
      setState('idle')
    }
  }

  const stopCall = () => {
    vapiRef.current?.stop()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">🎙️ AI Voice Assistant</h1>
          <p className="text-blue-100">Powered by Vapi + Groq</p>
        </div>

        {/* Status Badge */}
        <div className="p-6 border-b">
          <StatusBadge state={state} />
        </div>

        {/* Transcript */}
        <div className="p-6 h-96 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="text-center">
                {isCallActive
                  ? 'Start speaking...'
                  : 'Click "Start Conversation" to begin'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-red-700 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 bg-white border-t">
          {!isCallActive ? (
            <button
              onClick={startCall}
              disabled={state === 'connecting'}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {state === 'connecting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Conversation
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopCall}
              className="w-full py-4 px-6 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-3"
            >
              <MicOff className="w-5 h-5" />
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ state }: { state: AssistantState }) {
  const config = {
    idle: { emoji: '💤', text: 'Ready', bg: 'bg-gray-100', textColor: 'text-gray-600' },
    connecting: { emoji: '⚡', text: 'Connecting...', bg: 'bg-yellow-100', textColor: 'text-yellow-700' },
    listening: { emoji: '👂', text: 'Listening...', bg: 'bg-green-100', textColor: 'text-green-700' },
    thinking: { emoji: '🤔', text: 'Thinking...', bg: 'bg-blue-100', textColor: 'text-blue-700' },
    speaking: { emoji: '🗣️', text: 'Speaking...', bg: 'bg-purple-100', textColor: 'text-purple-700' },
  }

  const { emoji, text, bg, textColor } = config[state]

  return (
    <div className="flex items-center justify-center">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg}`}>
        <span className="text-lg">{emoji}</span>
        <span className={`font-medium text-sm ${textColor}`}>{text}</span>
      </div>
    </div>
  )
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'}`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
