'use client'

import { useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'
import { Mic, MicOff, Loader2, ArrowLeft } from 'lucide-react'
import { TUTORING_TOPICS, TutoringTopic, formatTutorPrompt } from '../lib/topics'
import TopicSelector from './topic-selector'

type AssistantState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

export default function VoiceAssistant() {
  const [selectedTopic, setSelectedTopic] = useState<TutoringTopic | null>(null)
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
      console.log('📞 Tutoring session started')
      setIsCallActive(true)
      setState('listening')
      setError('')
    })

    // Event: Call ended
    vapiRef.current.on('call-end', () => {
      console.log('📞 Tutoring session ended')
      setIsCallActive(false)
      setState('idle')
    })

    // Event: User starts speaking
    vapiRef.current.on('speech-start', () => {
      console.log('🎤 Student speaking')
      setState('listening')
    })

    // Event: User stops speaking
    vapiRef.current.on('speech-end', () => {
      console.log('🤔 Processing...')
      setState('thinking')
    })

    // Event: Transcript messages
    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage: Message = {
          role: message.role,
          text: message.transcript,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, newMessage])
      }
    })

    // Event: Speech events (both user and assistant)
    vapiRef.current.on('speech-start', () => {
      console.log('🗣️ Speech started')
      // State will be updated via message events
    })

    vapiRef.current.on('speech-end', () => {
      console.log('🤐 Speech ended')
      // State will be updated via message events
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

  const startTutoringSession = async (topic: TutoringTopic) => {
    try {
      setState('connecting')
      setError('')
      setMessages([])

      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

      if (!assistantId) {
        throw new Error('Assistant ID not configured')
      }

      // Start call with topic-specific system prompt override
      await vapiRef.current?.start(assistantId, {
        firstMessage: `Hello! I'm your ${topic.name} tutor. ${topic.emoji} I'm here to help you learn at your own pace. What would you like to start with, or should I suggest a good starting point?`,
      })

      // Send system prompt as a message after starting the call
      setTimeout(() => {
        vapiRef.current?.send({
          type: 'add-message',
          message: {
            role: 'system',
            content: formatTutorPrompt(topic),
          },
        })
      }, 1000)

      setSelectedTopic(topic)
    } catch (err) {
      console.error('Failed to start tutoring session:', err)
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setState('idle')
    }
  }

  const stopSession = () => {
    vapiRef.current?.stop()
    setSelectedTopic(null)
    setMessages([])
  }

  const backToTopics = () => {
    setSelectedTopic(null)
    setMessages([])
    setState('idle')
  }

  // Show topic selector if no topic selected
  if (!selectedTopic) {
    return (
      <TopicSelector topics={TUTORING_TOPICS} onSelectTopic={startTutoringSession} />
    )
  }

  // Show tutoring interface
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={backToTopics}
              disabled={isCallActive}
              className="flex items-center gap-2 text-sm hover:text-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Topic
            </button>
            <span className="text-2xl">{selectedTopic.emoji}</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {selectedTopic.name} Tutor
          </h1>
          <p className="text-blue-100 text-sm">
            {selectedTopic.description}
          </p>
        </div>

        {/* Status Badge */}
        <div className="p-4 border-b bg-gray-50">
          <StatusBadge state={state} />
        </div>

        {/* Transcript */}
        <div className="p-6 h-96 overflow-y-auto bg-white">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              {isCallActive ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
                  <p className="text-center">Tutor is preparing...</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">{selectedTopic.emoji}</div>
                  <p className="text-center text-gray-600 mb-2">
                    Ready to start learning!
                  </p>
                  <p className="text-center text-sm">
                    Click "Start Tutoring Session" to begin
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Learning Objectives Sidebar (shown when not in call) */}
        {!isCallActive && messages.length === 0 && (
          <div className="p-6 bg-purple-50 border-t border-purple-100">
            <h3 className="font-semibold text-sm text-purple-900 mb-3">
              📚 What you'll learn:
            </h3>
            <ul className="space-y-2">
              {selectedTopic.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-700">
                  <span className="text-purple-500 mt-0.5">✓</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
              onClick={() => startTutoringSession(selectedTopic)}
              disabled={state === 'connecting'}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {state === 'connecting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Tutoring Session
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="w-full py-4 px-6 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-3"
            >
              <MicOff className="w-5 h-5" />
              End Session
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
    speaking: { emoji: '🎓', text: 'Teaching...', bg: 'bg-purple-100', textColor: 'text-purple-700' },
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
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-purple-50 text-gray-900 border border-purple-200 rounded-bl-sm'}`}
      >
        <div className="flex items-start gap-2 mb-1">
          <span className="text-sm font-semibold">
            {isUser ? '👤 You' : '🎓 Tutor'}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
