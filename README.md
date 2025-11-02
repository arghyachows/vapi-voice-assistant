# Vapi Voice Assistant with Simli Avatar Integration

A Next.js application featuring voice assistant capabilities powered by Vapi and real-time avatar interactions using Simli.

## Features

- **Voice Assistant**: Interactive voice conversations with AI tutors on various topics
- **Simli Avatar Integration**: Real-time avatar with lip-sync capabilities (25-30 FPS rendering)
- **Low Latency**: Optimized for interactive applications with minimal delay
- **Multiple Avatar Models**: Support for both legacy and Trinity avatar models

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Vapi API keys
- Simli API key and face ID

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```env
# Vapi Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-vapi-public-key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-assistant-id

# Simli Configuration
NEXT_PUBLIC_SIMLI_API_KEY=your-simli-api-key
NEXT_PUBLIC_SIMLI_FACE_ID=your-face-id
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Usage

### Voice Assistant
Navigate to `/voice` to access the voice assistant with topic-based tutoring sessions.

### Avatar Assistant
Navigate to `/avatar` to experience real-time avatar interactions with lip-sync capabilities.

## Simli Avatar Setup

1. Get your API key from the [Simli Dashboard](https://simli.com)
2. Obtain a face ID for your avatar
3. Update the `faceID` in `components/simli-vapi-avatar.tsx`
4. The avatar supports 25-30 FPS rendering with low latency for interactive applications

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Voice**: Vapi AI Web SDK
- **Avatar**: Simli Client
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
