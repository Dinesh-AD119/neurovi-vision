import type { ReactNode } from "react";

export function MockBadge({ children = "FRONTEND MOCK", tone = "gold" }: { children?: ReactNode; tone?: "gold" | "crimson" | "moss" }) {
  const tones = {
    gold: "bg-accent/25 text-graphite border-accent/50",
    crimson: "bg-destructive/15 text-destructive border-destructive/40",
    moss: "bg-moss/20 text-moss border-moss/40",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow && <div className="font-mono text-xs uppercase tracking-[0.25em] text-primary mb-3">{eyebrow}</div>}
      <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{description}</p>}
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-warm">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl md:text-4xl text-gradient-warm">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-16">{children}</div>;
}

export function Disclaimer() {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-graphite">
      <div className="font-medium text-destructive mb-1">Medical Use Disclaimer</div>
      All model outputs are for educational and research purposes only. NeuroVision AI is not a medical device and must not be used for clinical diagnosis, treatment planning, or as a replacement for a qualified medical professional.
    </div>
  );
}