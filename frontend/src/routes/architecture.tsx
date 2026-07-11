import { createFileRoute } from "@tanstack/react-router";
import { MockBadge, PageShell, SectionHeader } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/architecture")({
  head: () => ({ meta: [{ title: "Model Architecture Explorer — NeuroVision AI" }, { name: "description", content: "Interactive walk through ResNet50 transfer learning and Phase-2 fine-tuning." }] }),
  component: ArchPage,
});

const STAGES = [
  { k: "Input", d: "224 × 224 × 3 · ResNet50 preprocess_input()" },
  { k: "Stem", d: "Conv 7×7 · stride 2 · MaxPool" },
  { k: "Stage 1", d: "3 residual blocks · 256 filters" },
  { k: "Stage 2", d: "4 residual blocks · 512 filters" },
  { k: "Stage 3", d: "6 residual blocks · 1024 filters" },
  { k: "Stage 4", d: "3 residual blocks · 2048 filters · last 50 layers unfrozen (Phase 2)" },
  { k: "Global Avg Pool", d: "2048-d embedding" },
  { k: "Classifier Head", d: "Dense → 4-way softmax" },
];

function ArchPage() {
  return (
    <PageShell>
      <SectionHeader eyebrow="Architecture Explorer" title="ResNet50 · Phase-2 fine-tuning." description="Only what is verified in the training code. Exact tensor shapes and parameter counts will populate once the model is introspected." />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          { k: "Backbone", v: "ResNet50 (ImageNet pretrained)" },
          { k: "Phase-2 unfrozen", v: "Last 50 base layers" },
          { k: "Optimizer", v: "Adam · lr 1e-5" },
          { k: "Loss", v: "Sparse categorical crossentropy" },
          { k: "Callbacks", v: "EarlyStopping · ModelCheckpoint" },
          { k: "Classes", v: "4 · Glioma / Meningioma / No Tumor / Pituitary" },
        ].map((x) => (
          <div key={x.k} className="rounded-xl border border-border bg-card p-5 shadow-warm">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{x.k}</div>
            <div className="mt-1 font-display text-xl">{x.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="font-display text-2xl">Layer flow</div>
        <div className="mt-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-3">
            {STAGES.map((s, i) => (
              <div key={s.k} className="w-56 shrink-0 rounded-xl border border-border bg-card p-4 shadow-warm relative">
                <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Stage {String(i + 1).padStart(2, "0")}</div>
                <div className="mt-1 font-display text-lg">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.d}</div>
                {i < STAGES.length - 1 && <div className="absolute top-1/2 -right-3 w-3 h-px bg-primary/50" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2 items-center">
        <div>
          <div className="font-display text-2xl">Residual connection · F(x) + x</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            Each residual block learns a residual function F(x) added to the input x. This lets very deep networks train stably by giving gradients a clean identity path.
          </p>
        </div>
        <ResidualDiagram />
      </div>

      <div className="mt-12">
        <SectionHeader title="Feature maps" description="Conceptual only — real intermediate activations will appear here once wired to the model." />
        <div className="mt-4"><MockBadge>Conceptual · not real activations</MockBadge></div>
        <div className="mt-4 grid gap-3 grid-cols-4 md:grid-cols-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-md border border-border bg-cinema overflow-hidden">
              <div className="h-full w-full" style={{ background: `radial-gradient(circle at ${20 + (i * 7) % 60}% ${20 + (i * 13) % 60}%, oklch(0.76 0.11 82 / 0.7) 0%, transparent 55%)` }} />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ResidualDiagram() {
  return (
    <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="oklch(0.62 0.13 40)" />
        </marker>
      </defs>
      <rect x="20" y="90" width="60" height="40" rx="6" fill="oklch(0.945 0.018 80)" stroke="oklch(0.62 0.13 40)" />
      <text x="50" y="115" textAnchor="middle" fontSize="12" fontFamily="JetBrains Mono">x</text>

      <rect x="140" y="30" width="120" height="40" rx="6" fill="oklch(0.76 0.11 82 / 0.25)" stroke="oklch(0.62 0.13 40)" />
      <text x="200" y="55" textAnchor="middle" fontSize="12" fontFamily="Cormorant Garamond">Conv → BN → ReLU</text>
      <rect x="140" y="90" width="120" height="40" rx="6" fill="oklch(0.76 0.11 82 / 0.25)" stroke="oklch(0.62 0.13 40)" />
      <text x="200" y="115" textAnchor="middle" fontSize="12" fontFamily="Cormorant Garamond">Conv → BN</text>
      <text x="200" y="150" textAnchor="middle" fontSize="11" fill="oklch(0.62 0.022 60)">F(x)</text>

      <circle cx="320" cy="110" r="18" fill="oklch(0.62 0.13 40)" />
      <text x="320" y="115" textAnchor="middle" fontSize="16" fill="oklch(0.98 0.008 80)">+</text>
      <text x="370" y="115" fontSize="12" fontFamily="JetBrains Mono">F(x)+x</text>

      <path d="M80 110 Q110 110 140 50" stroke="oklch(0.62 0.13 40)" fill="none" markerEnd="url(#arr)" />
      <path d="M80 110 L140 110" stroke="oklch(0.62 0.13 40)" fill="none" markerEnd="url(#arr)" />
      <path d="M80 110 Q210 200 302 110" stroke="oklch(0.76 0.11 82)" fill="none" strokeDasharray="4 4" markerEnd="url(#arr)" />
      <path d="M260 110 L302 110" stroke="oklch(0.62 0.13 40)" fill="none" markerEnd="url(#arr)" />
      <path d="M260 50 Q290 50 310 95" stroke="oklch(0.62 0.13 40)" fill="none" markerEnd="url(#arr)" />
    </svg>
  );
}