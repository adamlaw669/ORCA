'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import {
  RiPhoneLine,
  RiUserUnfollowLine,
  RiDashboard3Line,
  RiBarChartGroupedLine,
  RiMenuLine,
  RiCloseLine,
} from 'react-icons/ri';
import { FaXTwitter } from 'react-icons/fa6';

/* ─── Animation hooks ────────────────────────────────────────── */

function useIntersectionToggle(threshold = 0.35) {
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTriggered(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, triggered };
}

function useCountDown(from: number, to: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(from);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!trigger) { setValue(from); return; }

    const startTime = performance.now();
    const diff = to - from;
    const tick = (now: number) => {
      const raw = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setValue(from + diff * eased);
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [trigger, from, to, duration]);

  return value;
}

/* ─── Reusable primitives ────────────────────────────────────── */

function PrimaryButton({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button
      className={`h-11 px-6 bg-[#111111] text-white rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 hover:bg-black active:scale-[0.98] cursor-pointer${fullWidth ? ' w-full' : ''}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <button
      className={`h-11 px-6 bg-[#F3F4F6] text-[#111111] rounded-lg text-sm font-medium border border-[#E5E7EB] whitespace-nowrap transition-colors duration-150 hover:bg-[#E5E7EB] cursor-pointer${fullWidth ? ' w-full' : ''}`}
    >
      {children}
    </button>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-[rgba(250,250,250,0.9)] backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-20 h-16 flex items-center justify-between">
        <span className="font-bold text-base tracking-[0.04em] text-[#111111]">ORCA</span>

        <div className="hidden md:flex gap-8 items-center">
          {['Features', 'How it works', 'For operators'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-[#4B5563] hover:text-[#111111] transition-colors duration-150 no-underline"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          <Link href="/dashboard" className="no-underline"><GhostButton>Open dashboard</GhostButton></Link>
          <PrimaryButton>Request access</PrimaryButton>
        </div>

        <button
          className="md:hidden p-2 text-[#4B5563] hover:text-[#111111] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-4 flex flex-col gap-3">
          {['Features', 'How it works', 'For operators'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-[#4B5563] hover:text-[#111111] py-2 no-underline"
              onClick={() => setOpen(false)}
            >
              {link}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/dashboard" className="no-underline"><GhostButton fullWidth>Open dashboard</GhostButton></Link>
            <PrimaryButton fullWidth>Request access</PrimaryButton>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */

function HeroCalloutChip({ label }: { label: string }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs font-medium text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.06)] whitespace-nowrap">
      {label}
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-[#FAFAFA] px-4 sm:px-6 lg:px-20 py-14 lg:py-24">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 lg:gap-16 items-center">

        <div>
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-6">
            Omnichannel retention AI for Nigerian telecoms
          </p>

          <h1 className="font-bold text-[36px] sm:text-[44px] lg:text-[56px] text-[#111111] leading-[1.15] tracking-[-0.02em] max-w-[520px] mb-5">
            Your subscriber just tweeted their way out. ORCA caught it.
          </h1>

          <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-[460px] mb-10">
            The omnichannel retention platform built for MTN, Airtel, Glo, and 9mobile.
            Voice complaints and X posts. One queue. One score. One action.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="no-underline"><PrimaryButton>Open dashboard</PrimaryButton></Link>
            <GhostButton>See the platform</GhostButton>
          </div>

          <div className="mt-10">
            <p className="text-xs text-[#9CA3AF] mb-3">Trusted by retention teams at</p>
            <div className="flex flex-wrap gap-5 items-center">
              {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map((op) => (
                <span key={op} className="font-mono text-sm font-medium text-[#9CA3AF] tracking-[0.04em]">
                  {op}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-4 lg:mt-0">
          <div className="rounded-xl border border-[#E5E7EB] shadow-[0_16px_48px_rgba(0,0,0,0.1)] overflow-hidden">
            <ImagePlaceholder
              imageNumber={1}
              description="Agent dashboard - queue with subscriber profile panel"
              width="100%"
              height="300px"
            />
          </div>

          <div className="hidden sm:block absolute -top-4 right-0 lg:-right-4">
            <HeroCalloutChip label="Churn score 94 - flagged across 3 complaints" />
          </div>
          <div className="hidden sm:block absolute bottom-14 left-0 lg:-left-4">
            <HeroCalloutChip label="Assigned: Agent Yemi - SLA 4h remaining" />
          </div>
          <div className="hidden sm:block absolute -bottom-4 right-6">
            <HeroCalloutChip label="ML: likely to churn in 48h without contact" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem Statement ──────────────────────────────────────── */

function ProblemCard({ icon, iconColor, title, body, stat }: {
  icon: React.ReactNode; iconColor: string; title: string; body: string; stat: string;
}) {
  return (
    <div className="flex-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-6 lg:p-7">
      <div style={{ color: iconColor }}>{icon}</div>
      <h3 className="text-base font-semibold text-[#111111] mt-4">{title}</h3>
      <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">{body}</p>
      <p className="font-mono text-2xl font-medium text-[#DC2626] mt-4">{stat}</p>
    </div>
  );
}

function ProblemStatement() {
  return (
    <section id="how-it-works" className="bg-white px-4 sm:px-6 lg:px-20 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl sm:text-[28px] font-semibold text-[#111111] text-center max-w-[560px] mx-auto mb-10 leading-snug">
          The problem with churn is you find out after.
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          <ProblemCard
            icon={<RiPhoneLine size={32} />}
            iconColor="#DC2626"
            title="Voice complaints go to CRM, buried."
            body="Call logs pile up unread. The agent who took the call moved on. Babatunde is still waiting."
            stat="Avg response: 48h"
          />
          <ProblemCard
            icon={<FaXTwitter size={32} />}
            iconColor="#DC2626"
            title="Twitter / X complaints go nowhere."
            body="Your social team sees the tweet on Monday. The subscriber ported out on Friday."
            stat="Avg response: 72h"
          />
          <ProblemCard
            icon={<RiBarChartGroupedLine size={32} />}
            iconColor="#D97706"
            title="Usage drop-offs never get flagged."
            body="A subscriber drops from 10GB to 0.2GB. Nothing alerts. No one calls. Until they leave."
            stat="Not tracked at all."
          />
        </div>

        <p className="text-lg font-semibold text-[#111111] text-center mt-12">
          ORCA connects all three.
        </p>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section className="bg-[#FAFAFA] px-4 sm:px-6 lg:px-20 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl sm:text-[36px] font-bold text-[#111111] text-center max-w-[560px] mx-auto mb-12 leading-tight tracking-[-0.02em]">
          From complaint to resolved - in under 3 minutes.
        </h2>

        <div className="max-w-[800px] mx-auto mb-12 rounded-xl border border-[#E5E7EB] overflow-hidden">
          <ImagePlaceholder
            imageNumber={2}
            description="ORCA data flow: voice + X input, intelligence layer, three outputs"
            width="100%"
            height="180px"
          />
        </div>

        <div className="max-w-[640px] mx-auto flex flex-col gap-4 mb-12">
          {[
            'Subscriber Babatunde has called three times this week. Never resolved. He just tweeted at @MTNNigeria and said "never again."',
            'ORCA sees both signals. Scores him 94. Routes him to a senior retention agent with full context - call history, tweets, usage - before he ports out.',
          ].map((text, i) => (
            <p key={i} className="text-base text-[#4B5563] leading-relaxed text-center">{text}</p>
          ))}
        </div>

        <div className="flex flex-wrap justify-center border border-[#E5E7EB] rounded-lg overflow-hidden w-fit mx-auto bg-white">
          {[
            { icon: <RiPhoneLine size={14} />, label: 'Voice calls' },
            { icon: <FaXTwitter size={14} />, label: 'X / Twitter' },
            { icon: <RiBarChartGroupedLine size={14} />, label: 'Usage data' },
            { icon: null, label: 'WhatsApp (roadmap)', muted: true },
          ].map(({ icon, label, muted }, i, arr) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium ${muted ? 'text-[#9CA3AF]' : 'text-[#4B5563]'} ${i < arr.length - 1 ? 'border-r border-[#E5E7EB]' : ''}`}
            >
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Modules ────────────────────────────────────────── */

function FeatureCard({ icon, iconColor, title, body, imageNumber, imageDescription }: {
  icon: React.ReactNode; iconColor: string; title: string; body: string;
  imageNumber: number; imageDescription: string;
}) {
  return (
    <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl p-6 lg:p-8">
      <ImagePlaceholder imageNumber={imageNumber} description={imageDescription} width="100%" height="180px" />
      <div className="mt-6 mb-3" style={{ color: iconColor }}>{icon}</div>
      <h3 className="text-xl font-semibold text-[#111111]">{title}</h3>
      <p className="text-[15px] text-[#6B7280] mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-white px-4 sm:px-6 lg:px-20 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl sm:text-[36px] font-bold text-[#111111] mb-10 tracking-[-0.02em]">
          Four modules. One platform.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FeatureCard icon={<RiPhoneLine size={32} />} iconColor="#2563EB" title="Voice AI Agent"
            body="Handles calls in English, Yoruba, and Hausa. Retrieves CDR and billing context before the first word is spoken. Resolves or escalates with a full brief."
            imageNumber={3} imageDescription="Voice AI transcription and analysis interface" />
          <FeatureCard icon={<FaXTwitter size={32} />} iconColor="#111111" title="Social Intelligence"
            body="Monitors every mention of your brand handle in real time. Classifies, scores urgency, and auto-replies to resolvable complaints within 3 minutes."
            imageNumber={4} imageDescription="Live X/Twitter complaint monitoring stream" />
          <FeatureCard icon={<RiUserUnfollowLine size={32} />} iconColor="#DC2626" title="Churn Risk Engine"
            body="Every interaction builds a real-time churn score. HIGH and CRITICAL subscribers are surfaced to agents with personalised retention offers - before they port."
            imageNumber={5} imageDescription="Nigeria region churn risk heatmap" />
          <FeatureCard icon={<RiDashboard3Line size={32} />} iconColor="#059669" title="Human-in-the-Loop"
            body="One queue. Voice and X escalations sorted by urgency. Agents see the full context before they open their mouth or type a word."
            imageNumber={1} imageDescription="Agent dashboard with queue and subscriber profile" />
        </div>
      </div>
    </section>
  );
}

/* ─── Metrics Strip ──────────────────────────────────────────── */

function AnimatedMetric({ render, label, trigger, delay = 0, divider = true }: {
  render: (t: boolean) => React.ReactNode; label: string;
  trigger: boolean; delay?: number; divider?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!trigger) { setVisible(false); return; }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return (
    <div
      className={`flex-1 text-center py-8 lg:py-0 ${divider ? 'border-b lg:border-b-0 lg:border-r border-[rgba(255,255,255,0.15)]' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 400ms ease-out, transform 400ms ease-out',
      }}
    >
      <p className="font-mono text-[40px] sm:text-[48px] font-medium text-white leading-tight">
        {render(visible)}
      </p>
      <p className="text-sm text-[rgba(255,255,255,0.5)] mt-2">{label}</p>
    </div>
  );
}

function ResponseMetric({ trigger }: { trigger: boolean }) {
  const val = useCountDown(48, 4, 1600, trigger);
  return <span>48h to {Math.round(val)}h</span>;
}
function ChurnMetric({ trigger }: { trigger: boolean }) {
  const val = useCountDown(12, 4, 1400, trigger);
  return <span>12% to {Math.round(val)}%</span>;
}
function RevenueMetric({ trigger }: { trigger: boolean }) {
  const val = useCountDown(0, 2.4, 1800, trigger);
  return <span>N{val.toFixed(1)}B</span>;
}

function MetricsStrip() {
  const { ref, triggered } = useIntersectionToggle(0.35);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-[#111111] px-4 sm:px-6 lg:px-20 py-12 lg:py-16"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center">
        <AnimatedMetric label="Response time" trigger={triggered} delay={0} render={(a) => <ResponseMetric trigger={a} />} />
        <AnimatedMetric label="Churn rate" trigger={triggered} delay={150} render={(a) => <ChurnMetric trigger={a} />} />
        <AnimatedMetric label="Revenue protected" trigger={triggered} delay={300} divider={false} render={(a) => <RevenueMetric trigger={a} />} />
      </div>
      <p
        className="text-[13px] text-center mt-8 text-[rgba(255,255,255,0.4)]"
        style={{ opacity: triggered ? 1 : 0, transition: 'opacity 600ms ease-out 500ms' }}
      >
        Numbers from operator pilots.
      </p>
    </section>
  );
}

/* ─── Testimonial ────────────────────────────────────────────── */

function Testimonial() {
  return (
    <section className="bg-[#FAFAFA] px-4 sm:px-6 lg:px-20 py-14 lg:py-20">
      <div className="max-w-[560px] mx-auto text-center">
        <blockquote className="text-xl sm:text-[22px] text-[#111111] leading-relaxed">
          &quot;ORCA changed how our retention team operates. We used to find out a customer churned
          from the NCC report. Now we find out before they decide.&quot;
        </blockquote>
        <p className="text-sm font-medium text-[#4B5563] mt-6">
          Head of Customer Experience - [Operator Name]
        </p>
        <div className="w-20 h-6 bg-[#E5E7EB] rounded mx-auto mt-4 flex items-center justify-center">
          <span className="font-mono text-[11px] text-[#9CA3AF]">LOGO</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section id="for-operators" className="bg-white px-4 sm:px-6 lg:px-20 py-14 lg:py-24 text-center">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-3xl sm:text-[40px] font-bold text-[#111111] max-w-[560px] mx-auto leading-tight tracking-[-0.02em]">
          Ready to stop losing subscribers you could have saved?
        </h2>
        <p className="text-base sm:text-lg text-[#4B5563] mt-4 max-w-[480px] mx-auto leading-relaxed">
          Request access and we&apos;ll configure ORCA for your operator&apos;s stack in 48 hours.
        </p>
        <div className="flex justify-center mt-10">
          <PrimaryButton>Request access</PrimaryButton>
        </div>
        <p className="text-[13px] text-[#9CA3AF] mt-4">
          MTN, Airtel, Glo, and 9mobile configurations available.
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#0F0F0F] border-t border-[#1F1F1F] px-4 sm:px-6 lg:px-20 py-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <span className="font-bold text-base tracking-[0.04em] text-white block mb-3">ORCA</span>
          <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed max-w-[240px] mb-6">
            Omnichannel retention and complaint AI for Nigerian telecoms.
          </p>
          <p className="text-[13px] text-[rgba(255,255,255,0.3)]">{new Date().getFullYear()} ORCA. All rights reserved.</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-[rgba(255,255,255,0.3)] uppercase tracking-[0.08em] mb-4">Platform</p>
          {['Features', 'How it works', 'Request access', 'Login'].map((link) => (
            <a key={link} href="#"
              className="block text-sm text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.85)] transition-colors duration-150 no-underline mb-3">
              {link}
            </a>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-[rgba(255,255,255,0.3)] uppercase tracking-[0.08em] mb-4">Contact</p>
          <a href="mailto:hello@orca.ai"
            className="block text-sm text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.85)] transition-colors duration-150 no-underline mb-3">
            hello@orca.ai
          </a>
          <a href="#"
            className="inline-flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.85)] transition-colors duration-150 no-underline">
            <FaXTwitter size={14} />
            @orca_ai
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <Features />
      <MetricsStrip />
      <Testimonial />
      <FinalCTA />
      <Footer />
    </main>
  );
}
