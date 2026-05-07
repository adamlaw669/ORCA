import type { Pathway, RiskLevel, Sentiment } from '@/lib/types';

const RISK_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-status-clear/15 text-status-clear ring-1 ring-status-clear/30',
  MEDIUM: 'bg-accent/15 text-accent ring-1 ring-accent/30',
  HIGH: 'bg-status-critical/15 text-status-high ring-1 ring-status-high/30',
  CRITICAL: 'bg-status-critical text-white ring-1 ring-status-critical animate-pulse-live',
};

export function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-label uppercase font-data ${RISK_STYLES[level]}`}
      aria-label={`Churn risk ${level} score ${score}`}
    >
      <span className="opacity-60">RISK</span>
      <span>{score}</span>
      <span className="opacity-80">{level}</span>
    </span>
  );
}

const PATHWAY_STYLES: Record<Pathway, { cls: string; label: string }> = {
  AUTO_REPLY: {
    cls: 'bg-status-clear/15 text-status-clear ring-1 ring-status-clear/30',
    label: 'Auto-reply',
  },
  AGENT_PING: {
    cls: 'bg-accent/15 text-accent ring-1 ring-accent/30',
    label: 'Agent ping',
  },
  ESCALATE_FLAG: {
    cls: 'bg-status-critical/15 text-status-critical ring-1 ring-status-critical/30',
    label: 'Escalate',
  },
};

export function PathwayBadge({ pathway }: { pathway: Pathway }) {
  const s = PATHWAY_STYLES[pathway];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-label ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: number }) {
  const filled = '#FACC15';
  const empty = '#262626';
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md bg-canvas-sunken px-2 py-0.5 text-[11px] font-semibold uppercase tracking-label text-ink-2 ring-1 ring-chrome-1"
      aria-label={`Urgency ${urgency} of 5`}
    >
      <span className="opacity-60">URG</span>
      <span className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="h-2 w-1.5 rounded-sm"
            style={{ background: i <= urgency ? filled : empty }}
          />
        ))}
      </span>
      <span className="font-data">{urgency}/5</span>
    </span>
  );
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  negative: 'bg-status-critical/15 text-status-critical ring-1 ring-status-critical/30',
  neutral: 'bg-canvas-sunken text-ink-2 ring-1 ring-chrome-1',
  positive: 'bg-status-clear/15 text-status-clear ring-1 ring-status-clear/30',
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-label ${SENTIMENT_STYLES[sentiment]}`}>
      {sentiment}
    </span>
  );
}

export function CategoryChip({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-canvas-sunken px-2 py-0.5 text-[11px] font-medium text-ink-2 ring-1 ring-chrome-1">
      {category}
    </span>
  );
}

export function LanguageChip({ language }: { language: string }) {
  const label =
    language === 'pcm' ? 'PIDGIN' : language === 'yo' ? 'YORUBA' : language === 'ha' ? 'HAUSA' : 'EN';
  return (
    <span className="inline-flex items-center rounded-md bg-accent/15 px-1.5 py-0.5 font-data text-[10px] font-semibold uppercase tracking-label text-accent ring-1 ring-accent/30">
      {label}
    </span>
  );
}
