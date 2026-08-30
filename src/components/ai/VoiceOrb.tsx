'use client';

import React, { useState } from 'react';
import { Mic, Square, Sparkles, Volume2, Check } from 'lucide-react';
import { processVoiceInput } from '@/lib/ai/voice';

export type VoiceOrbState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'waiting_for_photo'
  | 'confirming'
  | 'reviewing'
  | 'saving'
  | 'completed'
  | 'error';

type VoiceOrbProps = {
  state: VoiceOrbState;
  onVoiceCaptured: (transcript: string) => void;
  subtitleText?: string;
  isProcessing?: boolean;
};

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onVoiceCaptured,
  subtitleText = 'Boliye...',
  isProcessing = false,
}) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleOrbTap = async () => {
    if (state === 'listening') {
      const text = await processVoiceInput();
      if (text) onVoiceCaptured(text);
    } else {
      // Simulate voice capture
      const text = await processVoiceInput();
      if (text) onVoiceCaptured(text);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onVoiceCaptured(inputText.trim());
    setInputText('');
    setShowTextInput(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-5 my-4">
      {/* Siri-style Central Voice Orb Container */}
      <div className="relative flex items-center justify-center py-4">
        {/* Outer Animated Glow Rings */}
        <div
          className={`absolute w-36 h-36 rounded-full transition-all duration-700 blur-xl opacity-60 ${
            state === 'listening'
              ? 'bg-[#b83230] scale-125 animate-pulse'
              : state === 'speaking'
              ? 'bg-[#4a7c59] scale-125 animate-ping'
              : state === 'processing'
              ? 'bg-[#f8e0a8] scale-110 animate-spin'
              : 'bg-[#c8e8d0] scale-100'
          }`}
        />

        <div
          className={`absolute w-28 h-28 rounded-full border-2 transition-all duration-500 ${
            state === 'listening'
              ? 'border-[#b83230]/60 scale-110 animate-ping'
              : state === 'speaking'
              ? 'border-[#4a7c59]/60 scale-110 animate-pulse'
              : 'border-[#4a7c59]/20 scale-100'
          }`}
        />

        {/* Primary Interactive Touch Orb Button */}
        <button
          type="button"
          onClick={handleOrbTap}
          disabled={isProcessing || state === 'saving'}
          className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 active:scale-95 shadow-[0_10px_35px_rgba(0,0,0,0.15)] focus:outline-none ${
            state === 'listening'
              ? 'bg-[#b83230] shadow-[0_10px_35px_rgba(184,50,48,0.45)]'
              : state === 'speaking'
              ? 'bg-[#4a7c59] shadow-[0_10px_35px_rgba(74,124,89,0.4)]'
              : state === 'processing'
              ? 'bg-[#705c30] shadow-[0_10px_35px_rgba(112,92,48,0.3)]'
              : 'bg-gradient-to-tr from-[#3d6849] via-[#4a7c59] to-[#68a379] hover:brightness-105'
          }`}
          aria-label="Product Saathi Voice Orb"
        >
          {state === 'processing' || state === 'saving' ? (
            <Sparkles className="w-10 h-10 animate-spin text-white" />
          ) : state === 'listening' ? (
            <Square className="w-10 h-10 fill-white" />
          ) : state === 'speaking' ? (
            <Volume2 className="w-10 h-10 animate-bounce text-white" />
          ) : (
            <Mic className="w-10 h-10 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Voice Status & Subtitle Cards */}
      <div className="w-full text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5f1ea] border border-[#c4c8bc]/40 font-headline font-bold text-xs text-[#2e3230] soft-shadow">
          {state === 'listening' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#b83230] animate-ping" />
              <span className="text-[#b83230]">🔴 Sun raha hoon... (Tap to stop)</span>
            </>
          )}
          {state === 'processing' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#705c30] animate-pulse" />
              <span className="text-[#705c30]">✨ Samajh raha hoon...</span>
            </>
          )}
          {state === 'speaking' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse" />
              <span className="text-[#4a7c59]">🔊 Bol raha hoon...</span>
            </>
          )}
          {state === 'idle' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#4a7c59]" />
              <span className="text-[#4a7c59]">🎙️ Tap karein aur bolna shuru karein</span>
            </>
          )}
        </div>

        {/* Accessible Text Subtitle Banner */}
        {subtitleText && (
          <div className="bg-white p-3.5 rounded-2xl border border-[#c4c8bc]/40 soft-shadow text-center max-w-sm mx-auto">
            <p className="font-body text-xs font-semibold text-[#2e3230] leading-relaxed">
              &ldquo;{subtitleText}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Secondary Text Input Toggle */}
      {!showTextInput ? (
        <button
          type="button"
          onClick={() => setShowTextInput(true)}
          className="font-label text-xs font-semibold text-[#6b6358] hover:text-[#4a7c59] underline underline-offset-4 pt-1"
        >
          Ya yahan likhein...
        </button>
      ) : (
        <form onSubmit={handleTextSubmit} className="w-full flex gap-2 animate-fade-in max-w-sm">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Jankari yahan likhein..."
            className="flex-1 bg-white border border-[#c4c8bc]/60 rounded-xl px-4 py-2.5 text-xs text-[#2e3230] font-body focus:ring-2 focus:ring-[#4a7c59] focus:outline-none soft-shadow"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#4a7c59] disabled:opacity-50 text-white p-2.5 rounded-xl hover:bg-[#3d6849] transition-colors shrink-0 shadow-sm"
          >
            <Check className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
