import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Disclaimer, MockBadge, SectionHeader, StatCard } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>
      <Hero />
      <PipelinePreview />
      <ExplainabilityPreview />
      <LimitationsPreview />
      <div className="mx-auto max-w-[1400px] px-6 pb-4"><Disclaimer /></div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-cinema opacity-[0.04] pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 pt-10 pb-20 md:pt-16 md:pb-28 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            ResNet50 · Phase-2 fine-tuned · 4 classes
          </div>
          <h1 className="mt-6 font-display text-6xl md:text-7xl leading-[0.95] tracking-tight">
            A cinematic lens on <span className="text-gradient-warm">brain MRI</span> classification.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            NeuroVision AI is a research interface for a four-class MRI classifier — Glioma, Meningioma, No Tumor, and Pituitary — built around a ResNet50 model with transparent metrics, model-attention explainability, and honest failure analysis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/analyze" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-3 font-medium shadow-warm hover:opacity-90 transition">
              Analyze MRI →
            </Link>
            <Link to="/performance" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-medium hover:bg-secondary transition">
              Explore Model Performance
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Official Acc." value="94.80%" sub="1,595 images" />
            <StatCard label="Classes" value="4" sub="GL · MN · NT · PT" />
            <StatCard label="Backbone" value="ResNet50" sub="Phase-2 fine-tune" />
            <StatCard label="Framework" value="Keras / TF" sub="2.15+ (Python)" />
          </div>
        </div>

        <MriChamber />
      </div>
    </section>
  );
}

function MriChamber() {
  return (
    <div className="relative aspect-square max-w-[560px] w-full mx-auto">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-warm opacity-25 blur-3xl animate-drift" />
      <div className="relative h-full w-full rounded-[2rem] border border-border bg-cinema overflow-hidden shadow-warm">
        {/* concentric anatomical contour rings */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-accent/40">
          <defs>
            <radialGradient id="brainG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.76 0.11 82 / 0.7)" />
              <stop offset="60%" stopColor="oklch(0.62 0.13 40 / 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="140" fill="url(#brainG)" />
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse key={i} cx="200" cy="200" rx={40 + i * 12} ry={30 + i * 11} fill="none" stroke="currentColor" strokeWidth="0.6" opacity={0.7 - i * 0.06} />
          ))}
          <path d="M120 200 Q160 130 200 200 T280 200" fill="none" stroke="oklch(0.94 0.012 75 / 0.4)" strokeWidth="1" />
          <path d="M120 220 Q160 150 200 220 T280 220" fill="none" stroke="oklch(0.94 0.012 75 / 0.25)" strokeWidth="1" />
        </svg>
        {/* scan sweep */}
        <div className="absolute inset-x-6 top-0 h-24 animate-mri-sweep" style={{ background: "var(--gradient-scan)" }} />
        {/* corner readouts */}
        <div className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-widest text-accent/80">
          MRI · T1 · 224×224
        </div>
        <div className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest text-accent/80">
          RESNET50 · Ph2
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-accent/70">
          <span>ATTENTION MAP READY</span>
          <span>CONF · —</span>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2"><MockBadge>Preview visual</MockBadge></div>
    </div>
  );
}

function PipelinePreview() {
  const steps = [
    { k: "01", t: "Upload MRI", d: "JPG/PNG image entering the workspace." },
    { k: "02", t: "Preprocess", d: "Resize to 224×224 · ResNet50 preprocess_input()." },
    { k: "03", t: "ResNet50 Phase-2", d: "Fine-tuned backbone with last 50 layers unfrozen." },
    { k: "04", t: "Softmax · 4-class", d: "Glioma · Meningioma · No Tumor · Pituitary." },
    { k: "05", t: "Confidence + Grad-CAM", d: "Top-1, Top-2, and model-attention overlay." },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="ML Pipeline" title="From raw MRI to a transparent, four-class prediction." description="A single, deterministic path through preprocessing, transfer learning, and explainability. Every stage is visible — nothing hidden behind marketing." />
      <div className="mt-10 grid gap-4 md:grid-cols-5">
        {steps.map((s) => (
          <div key={s.k} className="rounded-xl border border-border bg-card p-5 shadow-warm hover:-translate-y-0.5 transition-transform">
            <div className="font-mono text-xs text-primary tracking-widest">{s.k}</div>
            <div className="mt-3 font-display text-xl">{s.t}</div>
            <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExplainabilityPreview() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <SectionHeader eyebrow="Explainability" title="Grad-CAM as model attention — not tumor localization." description="Heatmaps reveal where the ResNet50 model looks when predicting. They are not clinical segmentations, bounding boxes, or evidence of tumor boundaries." />
        <div className="mt-6 flex items-center gap-3">
          <MockBadge>Studio preview</MockBadge>
          <Link to="/report" className="text-sm text-primary hover:underline">Open Explainability Studio →</Link>
        </div>
      </div>
      <div className="relative aspect-[4/3] rounded-2xl border border-border overflow-hidden bg-cinema shadow-warm">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 55% 42%, oklch(0.62 0.13 40 / 0.65) 0%, transparent 55%), radial-gradient(circle at 40% 60%, oklch(0.76 0.11 82 / 0.5) 0%, transparent 45%)" }} />
        <div className="absolute inset-0 grid grid-cols-3">
          <div className="border-r border-white/10 flex items-end p-3 text-[10px] font-mono uppercase tracking-widest text-accent/80">Original</div>
          <div className="border-r border-white/10 flex items-end p-3 text-[10px] font-mono uppercase tracking-widest text-accent/80">Heatmap</div>
          <div className="flex items-end p-3 text-[10px] font-mono uppercase tracking-widest text-accent/80">Overlay</div>
        </div>
      </div>
    </section>
  );
}

function LimitationsPreview() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
      <SectionHeader eyebrow="Known Limitations" title="The model has a real, documented weakness on Glioma." description="Glioma recall is 82.28% — some Glioma images are confused with Meningioma or No Tumor. We show this openly rather than hide it." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { t: "Glioma recall", v: "82.28%", d: "Lowest per-class recall — main weakness." },
          { t: "Test set size", v: "1,595", d: "Images in the official evaluation." },
          { t: "External set", v: "1,311", d: "Held-out generalization set." },
        ].map((x) => (
          <div key={x.t} className="rounded-xl border border-border bg-card p-6 shadow-warm">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{x.t}</div>
            <div className="mt-2 font-display text-4xl text-primary">{x.v}</div>
            <div className="mt-2 text-sm text-muted-foreground">{x.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


