'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, CheckCircle, Play, RotateCcw, AlertCircle } from 'lucide-react';

export type VoiceRecorderState = 'idle' | 'recording' | 'recorded' | 'processing';

type VoiceRecorderProps = {
  onTranscriptComplete?: (transcript: string) => void;
  onAudioRecorded?: (audioBlob: Blob, transcript?: string) => void;
  promptText?: string;
};

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptComplete,
  onAudioRecorded,
  promptText = 'Apna naam, kitne saal se ye kaam kar rahe hain aur apne craft ke baare mein batayein.',
}) => {
  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [audioUrl]);

  const getSupportedMimeType = (): string => {
    if (typeof window === 'undefined' || !window.MediaRecorder) return 'audio/webm';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Aapke browser mein audio recording support nahi hai.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        setState('recorded');

        if (onAudioRecorded) {
          onAudioRecorded(blob, transcript);
        }
      };

      // Start Browser Speech Recognition in parallel if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'hi-IN';

          let liveTranscript = '';
          recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                liveTranscript += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            const fullText = liveTranscript || interim;
            if (fullText) {
              setTranscript(fullText);
              if (onTranscriptComplete) onTranscriptComplete(fullText);
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (sttErr) {
          console.warn('Browser SpeechRecognition init notice:', sttErr);
        }
      }

      mediaRecorder.start(250);
      setState('recording');

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      let msg = 'Microphone permission avashyak hai.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Microphone ki permission Denied ho gayi hai. Kripya browser settings se permit karein.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Koi microphone input device nahi mila.';
      }
      setErrorMessage(msg);
      setState('idle');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
    setErrorMessage(null);
    setRecordingSeconds(0);
    setState('idle');
  };

  const handleMicButtonClick = () => {
    if (state === 'idle') {
      startRecording();
    } else if (state === 'recording') {
      stopRecording();
    } else if (state === 'recorded') {
      resetRecording();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-5 my-3">
      {/* Prompt Card */}
      <div className="bg-[#f5f1ea] p-4 rounded-2xl border border-[#c4c8bc]/40 text-center soft-shadow relative w-full">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#eae6de] rounded-full px-3 py-0.5 text-[#4a4e4a] text-[11px] font-bold font-label border border-[#c4c8bc]/40">
          💡 Bolne ke liye hint
        </div>
        <p className="text-[#2e3230] font-body text-xs font-medium mt-1 leading-relaxed">
          &ldquo;{promptText}&rdquo;
        </p>
      </div>

      {/* Error Banner if any */}
      {errorMessage && (
        <div className="w-full bg-[#fde8e8] border border-[#f8b4b4] text-[#b83230] p-3 rounded-xl flex items-center gap-2 text-xs font-body">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mic Control Button */}
      <button
        type="button"
        onClick={handleMicButtonClick}
        disabled={state === 'processing'}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 active:scale-95 focus:outline-none ${
          state === 'recording'
            ? 'bg-[#b83230] mic-pulse active shadow-[0_8px_30px_rgba(184,50,48,0.4)]'
            : state === 'recorded'
            ? 'bg-[#4a7c59] shadow-[0_8px_30px_rgba(74,124,89,0.3)]'
            : 'bg-[#4a7c59] hover:bg-[#3d6849] mic-pulse active shadow-[0_8px_30px_rgba(74,124,89,0.3)]'
        }`}
      >
        {state === 'processing' ? (
          <Sparkles className="w-9 h-9 animate-spin text-white" />
        ) : state === 'recording' ? (
          <Square className="w-9 h-9 fill-white" />
        ) : state === 'recorded' ? (
          <CheckCircle className="w-9 h-9 text-white" />
        ) : (
          <Mic className="w-9 h-9" />
        )}
      </button>

      {/* State Text & Feedback */}
      <div className="text-center w-full space-y-2">
        {state === 'recording' && (
          <div className="space-y-1">
            <p className="font-label text-[#b83230] font-bold text-sm animate-pulse flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b83230] animate-ping" />
              <span>Recording... ({formatSeconds(recordingSeconds)})</span>
            </p>
            <p className="font-label text-xs text-[#6b6358]">Tap button again to stop</p>
          </div>
        )}

        {state === 'idle' && (
          <p className="font-label text-[#4a7c59] font-bold text-base">
            🎙️ Bolna Shuru Karein
          </p>
        )}

        {state === 'recorded' && (
          <div className="w-full bg-white rounded-2xl p-4 border border-[#4a7c59]/40 text-[#2e3230] font-body text-xs leading-relaxed soft-shadow text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#4a7c59] font-label text-xs">
                <CheckCircle className="w-4 h-4 text-[#4a7c59]" />
                <span>Audio Recording Ready ({audioBlob ? `${Math.round(audioBlob.size / 1024)} KB` : ''})</span>
              </div>
              <button
                type="button"
                onClick={resetRecording}
                className="text-[#6b6358] hover:text-[#b83230] text-xs font-semibold flex items-center gap-1 underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-record</span>
              </button>
            </div>

            {audioUrl && (
              <audio src={audioUrl} controls className="w-full h-8 mt-1 rounded-lg" />
            )}

            {transcript && (
              <div className="bg-[#faf6f0] p-2.5 rounded-xl border border-[#c4c8bc]/30">
                <span className="font-label text-[10px] font-bold text-[#6b6358] block mb-0.5">Detected Transcript:</span>
                <p className="italic text-[#2e3230]">&ldquo;{transcript}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
