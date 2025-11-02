import Link from 'next/link'
import { Mic, User } from 'lucide-react'

export const metadata = {
  title: 'Vapi Voice Assistant | Groq AI',
  description: 'Minimalistic voice assistant powered by Vapi and Groq with avatar integration',
}

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vapi Assistant
          </h1>
          <p className="text-gray-600 mb-8">
            Choose your interaction mode
          </p>

          <div className="space-y-4">
            <Link
              href="/voice"
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Mic className="w-5 h-5" />
              Voice Assistant
            </Link>

            <Link
              href="/avatar"
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all"
            >
              <User className="w-5 h-5" />
              Avatar Assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
