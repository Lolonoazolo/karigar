'use client';

import React, { useState } from 'react';
import { Mic, Square, Sparkles, CheckCircle } from 'lucide-react';
import { processVoiceInput } from '@/lib/ai/voice';

type VoiceRecorderState = 'idle' | 'listening' | 'recording' | 'processing' | 'recorded';

type VoiceRecorderProps = {
  onTranscriptComplete: (transcript: string) => void;
  promptText?: string;
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptComplete,
  promptText = 'Apna naam, kitne saal se ye kaam kar rahe hain aur apne craft ke baare mein batayein.',
}) => {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [transcript, setTranscript] = useState<string>('');

  const handleMicToggle = async () => {
    if (state === 'idle') {
      setState('recording');
      // Simulate 3s voice recording process
      setTimeout(async () => {
        setState('processing');
        const text = await processVoiceInput();
        setTranscript(text);
        setState('recorded');
        onTranscriptComplete(text);
      }, 3000);
    } else if (state === 'recording') {
      setState('processing');
      const text = await processVoiceInput();
      setTranscript(text);
      setState('recorded');
      onTranscriptComplete(text);
    } else if (state === 'recorded') {
      setState('idle');
      setTranscript('');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 my-4">
      {/* Prompt Card */}
      <div className="bg-[#f5f1ea] p-5 rounded-2xl border border-[#c4c8bc]/40 text-center soft-shadow relative w-full">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#eae6de] rounded-full px-3 py-0.5 text-[#4a4e4a] text-xs font-bold font-label border border-[#c4c8bc]/40">
          💡 Bolne ke liye hint
        </div>
        <p className="text-[#2e3230] font-body text-sm font-medium mt-1 leading-relaxed">
          &ldquo;{promptText}&rdquo;
        </p>
      </div>

      {/* Mic Control Button */}
      <button
        onClick={handleMicToggle}
        disabled={state === 'processing'}
        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 active:scale-95 focus:outline-none ${
          state === 'recording'
            ? 'bg-[#b83230] mic-pulse active shadow-[0_8px_30px_rgba(184,50,48,0.4)]'
            : state === 'recorded'
            ? 'bg-[#4a7c59] shadow-[0_8px_30px_rgba(74,124,89,0.3)]'
            : 'bg-[#4a7c59] hover:bg-[#3d6849] mic-pulse active shadow-[0_8px_30px_rgba(74,124,89,0.3)]'
        }`}
      >
        {state === 'processing' ? (
          <Sparkles className="w-10 h-10 animate-spin text-white" />
        ) : state === 'recording' ? (
          <Square className="w-10 h-10 fill-white" />
        ) : state === 'recorded' ? (
          <CheckCircle className="w-10 h-10" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </button>

      {/* State Text & Transcript */}
      <div className="text-center w-full">
        {state === 'recording' && (
          <p className="font-label text-[#b83230] font-bold text-base animate-pulse">
            🔴 Sun raha hai... (Bolna band karne ke liye tap karein)
          </p>
        )}

        {state === 'processing' && (
          <p className="font-label text-[#705c30] font-bold text-base">
            ✨ AI aapki aawaaz ko text mein convert kar raha hai...
          </p>
        )}

        {state === 'idle' && (
          <p className="font-label text-[#4a7c59] font-bold text-lg">
            🎙️ Bolna Shuru Karein
          </p>
        )}

        {state === 'recorded' && (
          <div className="w-full bg-white rounded-xl p-4 border border-[#4a7c59]/40 text-[#2e3230] font-body text-sm leading-relaxed soft-shadow text-left space-y-2 fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4a7c59] font-label">
              <CheckCircle className="w-4 h-4" />
              <span>Aapki Kahani Recorded</span>
            </div>
            <p className="italic text-[#4a4e4a]">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
};
