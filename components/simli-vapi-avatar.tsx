'use client';

import { useEffect, useRef, useState } from 'react';
import { SimliClient } from 'simli-client';
import Vapi from '@vapi-ai/web';

export default function SimliVapiAvatar() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const simliClientRef = useRef<SimliClient | null>(null);
  const [vapi] = useState(() => new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const initializeSimli = async () => {
      try {
        setStatus('Initializing Simli client...');
        const simliClient = new SimliClient();
        simliClientRef.current = simliClient;

        // Check if required environment variables are set
        if (!process.env.NEXT_PUBLIC_SIMLI_API_KEY) {
          throw new Error('Simli API key not configured. Please set NEXT_PUBLIC_SIMLI_API_KEY in .env.local');
        }

        if (!process.env.NEXT_PUBLIC_SIMLI_FACE_ID || process.env.NEXT_PUBLIC_SIMLI_FACE_ID === 'your-face-id-here') {
          throw new Error('Simli face ID not configured. Please set NEXT_PUBLIC_SIMLI_FACE_ID in .env.local');
        }

        // Initialize Simli
        await simliClient.Initialize({
          apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY!,
          faceID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID!,
          handleSilence: true,
          maxSessionLength: 3600000, // 1 hour in milliseconds
          maxIdleTime: 5000,
          session_token: '',
          videoRef: videoRef.current!,
          audioRef: audioRef.current!,
          enableConsoleLogs: true, // Enable for debugging
          SimliURL: '',
          maxRetryAttempts: 3, // Reduce retries for faster feedback
          retryDelay_ms: 2000,
          videoReceivedTimeout: 15000,
          enableSFU: true,
          model: 'fasttalk',
        });

        setIsInitialized(true);
        setStatus('Ready to start call');
        setError('');
      } catch (err) {
        console.error('Failed to initialize Simli:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Simli client');
        setStatus('Initialization failed');
      }
    };

    initializeSimli();

    return () => {
      simliClientRef.current?.close();
    };
  }, []);

  const startCall = async () => {
    if (!simliClientRef.current) return;

    try {
      // Start Simli WebRTC connection
      await simliClientRef.current.start();

      // Start Vapi call
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);

      // Wait for Daily.co and capture audio
      const waitForDaily = new Promise<void>((resolve) => {
        const checkDaily = () => {
          const dailyCall = vapi.getDailyCallObject();
          if (dailyCall) {
            dailyCall.on('track-started', (event) => {
              if (
                event.participant &&
                !event.participant.local &&
                event.track.kind === 'audio'
              ) {
                // Use Simli's built-in audio listening instead of manual processing
                // This avoids audio feedback and processing issues
                simliClientRef.current?.listenToMediastreamTrack(event.track);

                // Mute Vapi's audio player to prevent feedback
                setTimeout(() => {
                  if (event.participant) {
                    const vapiAudio = document.querySelector(
                      `audio[data-participant-id="${event.participant.session_id}"]`
                    );
                    if (vapiAudio) {
                      (vapiAudio as HTMLAudioElement).muted = true;
                      (vapiAudio as HTMLAudioElement).volume = 0;
                    }
                  }
                }, 100);
              }
            });
            resolve();
          } else {
            setTimeout(checkDaily, 100);
          }
        };
        checkDaily();
      });

      await waitForDaily;
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = async () => {
    await vapi.stop();
    simliClientRef.current?.close();
    setIsCallActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl">
        {/* Status Display */}
        <div className="mb-4 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            error ? 'bg-red-100 text-red-700' :
            isInitialized ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            <span className="font-medium text-sm">{status}</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Please check your Simli API key and face ID configuration in .env.local
            </p>
          </div>
        )}

        {/* Video Display */}
        <div className="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video object-cover"
            style={{ display: isInitialized ? 'block' : 'none' }}
          />
          <audio ref={audioRef} autoPlay />

          {/* Placeholder when not initialized */}
          {!isInitialized && !error && (
            <div className="w-full aspect-video flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                <p className="text-sm">Setting up avatar...</p>
              </div>
            </div>
          )}

          {/* Error placeholder */}
          {error && (
            <div className="w-full aspect-video flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-sm">Avatar setup failed</p>
              </div>
            </div>
          )}
        </div>

        {/* Control Button */}
        <div className="mt-6 text-center">
          <button
            onClick={isCallActive ? endCall : startCall}
            disabled={!isInitialized || !!error}
            className={`px-8 py-3 rounded-full font-semibold text-white transition-all ${
              isCallActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {!isInitialized && !error
              ? 'Setting up...'
              : error
              ? 'Configuration Error'
              : isCallActive
              ? 'End Call'
              : 'Start Call'}
          </button>
        </div>
      </div>
    </div>
  );
}
