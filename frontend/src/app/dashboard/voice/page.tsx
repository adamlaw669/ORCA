'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RiMicLine,
  RiMicOffLine,
  RiSendPlane2Line,
  RiVolumeUpLine,
  RiLoader4Line,
  RiStopCircleLine,
} from 'react-icons/ri';
import { api } from '@/lib/api';
import type { VoiceMessage } from '@/lib/types';

type RecordState = 'idle' | 'recording' | 'processing';

const QUICK_PROMPTS = [
  'My data is finishing too fast',
  'Omo this MTN network is terrible',
  'Mo fe dupe, service e dara',
  'Help me, billing issue',
];

function riskColor(score: number) {
  if (score >= 75) return 'text-status-critical';
  if (score >= 50) return 'text-status-watch';
  return 'text-status-clear';
}

function riskBarColor(score: number) {
  if (score >= 75) return 'bg-status-critical';
  if (score >= 50) return 'bg-status-watch';
  return 'bg-status-clear';
}

function langLabel(code: string) {
  return code === 'yo' ? 'Yoruba' : code === 'ha' ? 'Hausa' : 'English';
}

export default function VoicePage() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, recordState]);

  const buildHistory = useCallback(() => {
    return messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text || '[Audio]',
    }));
  }, [messages]);

  const playTTS = useCallback((msgId: string, blob: Blob) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(msgId);
    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    };
    audio.play().catch(() => setPlayingId(null));
  }, []);

  const sendMessage = useCallback(
    async (text?: string, audioBlob?: Blob) => {
      if (!text && !audioBlob) return;

      const userMsg: VoiceMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: text || '[Voice message]',
        audioBlob,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setRecordState('processing');
      setError(null);

      try {
        const history = buildHistory();
        const data = await api.chat(text, audioBlob, history);

        const ttsBlob = await api.tts(data.reply, data.detected_language || 'en');

        const agentMsg: VoiceMessage = {
          id: crypto.randomUUID(),
          role: 'agent',
          text: data.reply,
          ttsBlob: ttsBlob ?? undefined,
          meta: {
            classification: data.classification,
            churn_score: data.churn_score,
            summary: data.summary,
            detected_language: data.detected_language,
            action_taken: data.action_taken,
          },
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, agentMsg]);

        if (ttsBlob) {
          playTTS(agentMsg.id, ttsBlob);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setRecordState('idle');
      }
    },
    [buildHistory, playTTS]
  );

  const startRecording = useCallback(async () => {
    if (recordState !== 'idle') return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, {
          type: mr.mimeType || 'audio/webm',
        });
        if (blob.size > 100) {
          sendMessage(undefined, blob);
        } else {
          setRecordState('idle');
        }
      };

      mr.start();
      setRecordState('recording');
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
      setRecordState('idle');
    }
  }, [recordState, sendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (recordState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recordState, startRecording, stopRecording]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || recordState !== 'idle') return;
    setInputText('');
    sendMessage(text);
  }, [inputText, recordState, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastMeta = messages.filter((m) => m.role === 'agent' && m.meta).at(-1)?.meta;
  const voiceCount = messages.filter((m) => m.audioBlob).length;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-chrome-1 bg-canvas-elevated px-6">
        <div>
          <h1 className="text-[15px] font-semibold text-ink-1">Voice Agent</h1>
          <p className="font-data text-[11px] text-ink-3">Demo · Baba Sikira · MTN Nigeria</p>
        </div>

        {lastMeta && (
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="font-data text-[10px] uppercase tracking-label text-ink-3">Churn</span>
              <span className={`font-data text-[13px] font-bold ${riskColor(lastMeta.churn_score)}`}>
                {lastMeta.churn_score}/100
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-data text-[10px] uppercase tracking-label text-ink-3">Category</span>
              <span className="rounded-sm bg-canvas-sunken border border-chrome-1 px-2 py-0.5 font-data text-[11px] text-ink-2">
                {lastMeta.classification}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-data text-[10px] uppercase tracking-label text-ink-3">Lang</span>
              <span className="font-data text-[12px] font-medium text-ink-1">
                {langLabel(lastMeta.detected_language)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden bg-canvas">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-chrome-2 bg-canvas-elevated">
                  <RiMicLine size={32} className="text-ink-3" />
                </div>
                <p className="text-[15px] font-semibold text-ink-1">Talk to ORCA</p>
                <p className="mt-1 max-w-xs text-[13px] text-ink-3">
                  Click the mic button to speak, or type below. ORCA will respond in English, Yoruba, or Hausa.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      disabled={recordState !== 'idle'}
                      className="rounded-lg border border-chrome-1 bg-canvas-elevated px-3 py-2.5 text-left text-[12px] text-ink-2 transition-colors hover:border-chrome-2 hover:bg-canvas-sunken hover:text-ink-1 disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[68%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="px-1 font-data text-[10px] uppercase tracking-label text-ink-3">
                    {msg.role === 'user' ? 'Customer' : 'ORCA Agent'}
                  </span>

                  <div
                    className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-status-info text-white'
                        : 'rounded-tl-sm border border-chrome-1 bg-canvas-elevated text-ink-1'
                    }`}
                  >
                    {msg.role === 'user' && msg.audioBlob && (
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-blue-200">
                        <RiMicLine size={11} />
                        <span className="font-data uppercase tracking-label">Voice message</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {msg.role === 'agent' && (
                    <div className="flex flex-wrap items-center gap-2 px-1">
                      {msg.ttsBlob && (
                        <button
                          onClick={() => playTTS(msg.id, msg.ttsBlob!)}
                          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] transition-colors ${
                            playingId === msg.id
                              ? 'bg-blue-50 text-status-info'
                              : 'text-ink-3 hover:bg-canvas-sunken hover:text-ink-1'
                          }`}
                        >
                          <RiVolumeUpLine size={13} />
                          {playingId === msg.id ? 'Playing…' : 'Play response'}
                        </button>
                      )}
                      {msg.meta && (
                        <>
                          <span className="rounded-sm border border-chrome-1 bg-canvas-sunken px-2 py-0.5 font-data text-[10px] text-ink-3">
                            {msg.meta.classification}
                          </span>
                          <span
                            className={`rounded-sm border border-chrome-1 bg-canvas-sunken px-2 py-0.5 font-data text-[10px] font-semibold ${riskColor(msg.meta.churn_score)}`}
                          >
                            Churn {msg.meta.churn_score}%
                          </span>
                          {msg.meta.action_taken && (
                            <span className="rounded-sm border border-green-200 bg-status-clear-bg px-2 py-0.5 font-data text-[10px] text-status-clear">
                              ✓ {msg.meta.action_taken}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <span className="px-1 font-data text-[10px] text-ink-3">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {recordState === 'processing' && (
              <div className="flex animate-fade-in justify-start">
                <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-chrome-1 bg-canvas-elevated px-4 py-3">
                  <RiLoader4Line size={15} className="animate-spin text-ink-3" />
                  <span className="text-[13px] text-ink-3">ORCA is thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-2 rounded-lg border border-red-200 bg-status-critical-bg px-4 py-2.5 text-[13px] text-status-critical">
              {error}
            </div>
          )}

          {/* Input bar */}
          <div className="flex-shrink-0 border-t border-chrome-1 bg-canvas-elevated p-4">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={recordState !== 'idle'}
                placeholder={
                  recordState === 'recording'
                    ? 'Recording… click mic to send'
                    : recordState === 'processing'
                      ? 'Processing…'
                      : 'Type a message or click mic to speak…'
                }
                className="flex-1 rounded-xl border border-chrome-1 bg-canvas px-4 py-3 text-[14px] text-ink-1 placeholder-ink-3 focus:border-chrome-2 focus:outline-none focus:ring-2 focus:ring-status-info/20 disabled:opacity-50"
              />

              {/* Mic button */}
              <button
                onClick={toggleRecording}
                disabled={recordState === 'processing'}
                title={recordState === 'recording' ? 'Stop recording' : 'Start recording'}
                className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                  recordState === 'recording'
                    ? 'border-status-critical bg-status-critical text-white shadow-lg shadow-red-200'
                    : recordState === 'processing'
                      ? 'cursor-not-allowed border-chrome-1 bg-canvas text-ink-3 opacity-50'
                      : 'border-chrome-1 bg-canvas text-ink-2 hover:border-status-info hover:text-status-info'
                }`}
              >
                {recordState === 'recording' && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-40" />
                )}
                {recordState === 'recording' ? (
                  <RiStopCircleLine size={20} />
                ) : recordState === 'processing' ? (
                  <RiLoader4Line size={20} className="animate-spin" />
                ) : (
                  <RiMicLine size={20} />
                )}
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || recordState !== 'idle'}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-status-info text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <RiSendPlane2Line size={18} />
              </button>
            </div>

            <p className="mt-2 text-center font-data text-[11px] text-ink-3">
              {recordState === 'recording'
                ? 'Click mic again to stop and send'
                : recordState === 'processing'
                  ? 'Processing your message…'
                  : 'Click mic to record · Enter to send text · Responds in your language'}
            </p>
          </div>
        </div>

        {/* Right sidebar — shown after first agent response */}
        {lastMeta && (
          <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-chrome-1 bg-canvas-elevated p-5">
            <p className="mb-4 font-data text-[10px] uppercase tracking-label text-ink-3">
              Session Intelligence
            </p>

            {/* Churn gauge */}
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] text-ink-3">Churn Risk</span>
                <span className={`font-data text-[13px] font-bold ${riskColor(lastMeta.churn_score)}`}>
                  {lastMeta.churn_score} / 100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-canvas-sunken">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${riskBarColor(lastMeta.churn_score)}`}
                  style={{ width: `${lastMeta.churn_score}%` }}
                />
              </div>
              <p className="mt-1 font-data text-[10px] text-ink-3">
                {lastMeta.churn_score >= 75
                  ? 'CRITICAL — immediate action needed'
                  : lastMeta.churn_score >= 50
                    ? 'HIGH — escalation recommended'
                    : lastMeta.churn_score >= 25
                      ? 'MEDIUM — monitor closely'
                      : 'LOW — stable customer'}
              </p>
            </div>

            <div className="mb-4">
              <span className="mb-1 block font-data text-[10px] uppercase tracking-label text-ink-3">Category</span>
              <span className="inline-block rounded-md border border-chrome-1 bg-canvas-sunken px-2.5 py-1 text-[12px] text-ink-1">
                {lastMeta.classification}
              </span>
            </div>

            <div className="mb-4">
              <span className="mb-1 block font-data text-[10px] uppercase tracking-label text-ink-3">Language</span>
              <span className="text-[13px] font-medium text-ink-1">{langLabel(lastMeta.detected_language)}</span>
            </div>

            <div className="mb-4">
              <span className="mb-1 block font-data text-[10px] uppercase tracking-label text-ink-3">AI Summary</span>
              <p className="text-[12px] leading-relaxed text-ink-2">{lastMeta.summary}</p>
            </div>

            {lastMeta.action_taken && (
              <div className="mb-4">
                <span className="mb-1 block font-data text-[10px] uppercase tracking-label text-ink-3">
                  Action Taken
                </span>
                <p className="text-[12px] font-medium text-status-clear">{lastMeta.action_taken}</p>
              </div>
            )}

            <div className="border-t border-chrome-1 pt-4">
              <span className="mb-2 block font-data text-[10px] uppercase tracking-label text-ink-3">Session</span>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink-3">Total messages</span>
                  <span className="font-data font-semibold text-ink-1">{messages.length}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink-3">Voice messages</span>
                  <span className="font-data font-semibold text-ink-1">{voiceCount}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink-3">AI turns</span>
                  <span className="font-data font-semibold text-ink-1">
                    {messages.filter((m) => m.role === 'agent').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
