'use client'

import { TutoringTopic } from '../lib/topics'

interface TopicSelectorProps {
  topics: TutoringTopic[]
  onSelectTopic: (topic: TutoringTopic) => void
}

export default function TopicSelector({ topics, onSelectTopic }: TopicSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎓 AI Tutor
          </h1>
          <p className="text-xl text-white/90">
            Choose a subject to start learning with your AI tutor
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={() => onSelectTopic(topic)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/80 text-sm">
            💡 Your AI tutor adapts to your learning pace and style
          </p>
        </div>
      </div>
    </div>
  )
}

function TopicCard({ topic, onClick }: { topic: TutoringTopic; onClick: () => void }) {
  const levelColors = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500',
  }

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{topic.emoji}</div>
        <span className={`text-xs font-semibold text-white px-3 py-1 rounded-full ${levelColors[topic.skillLevel]}`}>
          {topic.skillLevel}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
        {topic.name}
      </h3>

      <p className="text-gray-600 text-sm mb-4">
        {topic.description}
      </p>

      <div className="space-y-1">
        {topic.learningObjectives.slice(0, 2).map((objective, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
            <span className="text-purple-500 mt-0.5">✓</span>
            <span>{objective}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-purple-600 font-semibold text-sm group-hover:underline">
          Start Learning →
        </span>
      </div>
    </button>
  )
}
