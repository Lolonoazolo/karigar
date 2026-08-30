'use client';

import React, { useState } from 'react';
import { Mic, Square, Sparkles, Check, RefreshCw } from 'lucide-react';
import { processVoiceInput } from '@/lib/ai/voice';

type AIMessageBubbleProps = {
  text: string;
  quickChoices?: { label: string; value: string | number }[];
  onChoiceSelect?: (value: string | number) => void;
};

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({
  text,
  quickChoices,
  onChoiceSelect,
}) => {
  return (
    <div className="flex items-start gap-3 w-full animate-fade-in my-2">
      <div className="w-11 h-11 rounded-2xl bg-[#d8f0de] border border-[#4a7c59]/30 text-2xl flex items-center justify-center shrink-0 soft-shadow">
        🤖
      </div>
      <div className="flex-1 space-y-2">
        <div className="bg-white p-4 rounded-2xl rounded-tl-none soft-shadow border border-[#c4c8bc]/40 text-[#2e3230]">
          <p className="font-headline font-bold text-base leading-snug">{text}</p>
        </div>

        {quickChoices && quickChoices.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickChoices.map((choice) => (
              <button
                key={String(choice.value)}
                type="button"
                onClick={() => onChoiceSelect && onChoiceSelect(choice.value)}
                className="bg-[#faf6f0] hover:bg-[#f0ece4] text-[#4a7c59] border border-[#4a7c59]/40 font-label font-bold text-xs py-2 px-3.5 rounded-full transition-all active:scale-95 soft-shadow flex items-center gap-1.5"
              >
                <span>{choice.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type ArtisanMessageBubbleProps = {
  text: string;
  onEdit?: () => void;
};

export const ArtisanMessageBubble: React.FC<ArtisanMessageBubbleProps> = ({
  text,
  onEdit,
}) => {
  return (
    <div className="flex items-start justify-end gap-2.5 w-full animate-fade-in my-2">
      <div className="flex flex-col items-end max-w-[82%] space-y-1">
        <div className="bg-[#4a7c59] text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm font-body text-sm font-medium leading-relaxed">
          {text}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-[11px] font-label font-semibold text-[#6b6358] hover:text-[#4a7c59] flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Badlein</span>
          </button>
        )}
      </div>
      <div className="w-9 h-9 rounded-full bg-[#f8e0a8] border border-[#c4c8bc]/40 flex items-center justify-center text-base shrink-0 shadow-sm">
        👤
      </div>
    </div>
  );
};

type VoiceInputBarProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  isProcessing?: boolean;
};

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSubmit,
  placeholder = 'Ya yahan likhein...',
  isProcessing = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleMicTap = async () => {
    if (isRecording) {
      setIsRecording(false);
      const text = await processVoiceInput();
      if (text) onSubmit(text);
    } else {
      setIsRecording(true);
      // Simulate 3s voice recording
      setTimeout(async () => {
        setIsRecording(false);
        const text = await processVoiceInput();
        if (text) onSubmit(text);
      }, 3000);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 pt-2">
      {/* Primary Voice Mic Button */}
      <div className="flex flex-col items-center space-y-2">
        <button
          type="button"
          onClick={handleMicTap}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 active:scale-95 focus:outline-none ${
            isRecording
              ? 'bg-[#b83230] shadow-[0_8px_30px_rgba(184,50,48,0.4)] animate-pulse'
              : 'bg-[#4a7c59] hover:bg-[#3d6849] shadow-[0_8px_30px_rgba(74,124,89,0.35)]'
          }`}
          aria-label="Bol kar batayein"
        >
          {isProcessing ? (
            <Sparkles className="w-9 h-9 animate-spin text-white" />
          ) : isRecording ? (
            <Square className="w-9 h-9 fill-white" />
          ) : (
            <Mic className="w-9 h-9 text-white stroke-[2.5]" />
          )}
        </button>

        <span className="font-headline font-bold text-sm text-[#4a7c59]">
          {isRecording ? '🔴 Sun raha hoon... (Tap to stop)' : '🎙️ Bol kar batayein'}
        </span>
      </div>

      {/* Secondary Text Input Toggle */}
      {!showTextInput ? (
        <button
          type="button"
          onClick={() => setShowTextInput(true)}
          className="font-label text-xs font-semibold text-[#6b6358] hover:text-[#4a7c59] underline underline-offset-4"
        >
          Ya yahan likhein...
        </button>
      ) : (
        <form onSubmit={handleTextSubmit} className="w-full flex gap-2 animate-fade-in">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-white border border-[#c4c8bc]/60 rounded-xl px-4 py-3 text-sm text-[#2e3230] font-body focus:ring-2 focus:ring-[#4a7c59] focus:outline-none soft-shadow"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#4a7c59] disabled:opacity-50 text-white p-3 rounded-xl hover:bg-[#3d6849] transition-colors shrink-0 shadow-sm"
          >
            <Check className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
};

export const FriendlyLoader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-[#c4c8bc]/30 soft-shadow animate-pulse my-2">
      <div className="w-8 h-8 rounded-full bg-[#f8e0a8] flex items-center justify-center text-lg shrink-0">
        ✨
      </div>
      <p className="font-headline font-bold text-sm text-[#705c30]">{message}</p>
    </div>
  );
};
