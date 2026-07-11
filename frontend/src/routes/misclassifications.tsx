import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getMode, getMisclassifications, getMisclassificationGradcam } from "@/services/predictionService";
import { MisclassificationItem, GradCamResponse } from "@/types/api";
import { MockBadge, PageShell, SectionHeader } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/misclassifications")({
  head: () => ({ meta: [{ title: "Misclassification Explorer — NeuroVision AI" }, { name: "description", content: "Browse verified model mistakes with actual and predicted classes." }] }),
  component: MisPage,
});

const CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"] as const;
type C = typeof CLASSES[number];

const MOCK_CASES: MisclassificationItem[] = [
  { file: "BT-MRI Test GL (89).jpg", relative_path: "", actual: "Glioma", predicted: "Meningioma", conf: 0.612, confidence_level: "LOW", prediction_margin: 12.0, top_2: [], probabilities: [] },
  { file: "Te-gl_115.jpg", relative_path: "", actual: "Glioma", predicted: "Meningioma", conf: 0.9964, confidence_level: "VERY HIGH", prediction_margin: 99.0, top_2: [], probabilities: [] },
  { file: "Te-gl_042.jpg", relative_path: "", actual: "Glioma", predicted: "Meningioma", conf: 0.573, confidence_level: "LOW", prediction_margin: 8.0, top_2: [], probabilities: [] },
  { file: "Te-me_201.jpg", relative_path: "", actual: "Meningioma", predicted: "Glioma", conf: 0.681, confidence_level: "LOW", prediction_margin: 10.0, top_2: [], probabilities: [] },
  { file: "Te-pi_118.jpg", relative_path: "", actual: "Pituitary", predicted: "Meningioma", conf: 0.520, confidence_level: "LOW", prediction_margin: 4.0, top_2: [], probabilities: [] },
];

function MisPage() {
  const [actual, setActual] = useState<"all" | C>("all");
  const [predicted, setPredicted] = useState<"all" | C>("all");
  const [idx, setIdx] = useState(0);
  const [cases, setCases] = useState<MisclassificationItem[]>(MOCK_CASES);
  const [isLiveMode, setIsLiveMode] = useState(getMode() === "live");
  const [cam, setCam] = useState<GradCamResponse | null>(null);
  const [loadingCam, setLoadingCam] = useState(false);

  useEffect(() => {
    const activeMode = getMode();
    setIsLiveMode(activeMode === "live");
    if (activeMode === "live") {
      getMisclassifications()
        .then(setCases)
        .catch(console.error);
    }
  }, []);

  const filtered = useMemo(() =>
    cases.filter(c => (actual === "all" || c.actual === actual) && (predicted === "all" || c.predicted === predicted)),
    [cases, actual, predicted]);

  const dist = useMemo(() => {
    const m = new Map<string, number>();
    cases.forEach(c => {
      const k = `${c.actual}→${c.predicted}`;
      m.set(k, (m.get(k) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [cases]);

  const cur = filtered[idx % Math.max(1, filtered.length)];

  // Fetch Grad-CAM for the active case
  useEffect(() => {
    if (isLiveMode && cur && cur.relative_path) {
      setLoadingCam(true);
      setCam(null);
      getMisclassificationGradcam(cur.relative_path)
        .then(setCam)
        .catch(err => {
          console.error("Grad-CAM load failed:", err);
        })
        .finally(() => {
          setLoadingCam(false);
        });
    } else {
      setCam(null);
    }
  }, [cur, isLiveMode]);

  return (
    <PageShell>
      <div className="flex justify-between flex-wrap gap-4 items-start">
        <SectionHeader eyebrow="Misclassification Explorer" title="What the model gets wrong, on the record." description="Failures from the actual evaluation set, plus additional labeled placeholders for interface completeness." />
        <div className="flex gap-2">
          {isLiveMode ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest bg-moss/20 text-moss border-moss/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Live API Explorer
            </span>
          ) : (
            <MockBadge>Grad-CAM per case is placeholder</MockBadge>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <Select label="Actual" value={actual} onChange={(v) => { setActual(v as "all" | C); setIdx(0); }} />
        <Select label="Predicted" value={predicted} onChange={(v) => { setPredicted(v as "all" | C); setIdx(0); }} />
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Cases</div>
          <div className="font-display text-2xl">{filtered.length}</div>
        </div>
      </div>

      {cur && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-warm">
            <div className="relative aspect-square rounded-xl bg-cinema overflow-hidden border border-border">
              {isLiveMode && cam ? (
                <img src={cam.overlay} className="absolute inset-0 h-full w-full object-cover animate-fade-in" alt="mri misclassification overlay" />
              ) : (
                <>
                  <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, oklch(0.76 0.11 82 / 0.35) 0%, transparent 60%)" }} />
                  <div className="absolute inset-0 flex items-center justify-center text-ivory/70 font-mono text-sm">
                    {loadingCam ? "Generating live Grad-CAM..." : "MRI · placeholder"}
                  </div>
                </>
              )}
              <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest text-accent bg-black/40 px-1 rounded">{cur.file}</div>
            </div>
            <div className="mt-4 flex justify-between">
              <button onClick={() => setIdx((i) => Math.max(0, i - 1))} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary cursor-pointer">← Prev</button>
              <div className="text-sm text-muted-foreground font-mono">{(idx % Math.max(1, filtered.length)) + 1} / {filtered.length}</div>
              <button onClick={() => setIdx((i) => (i + 1) % filtered.length)} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary cursor-pointer">Next →</button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm space-y-4">
            <div><div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Actual</div><div className="font-display text-2xl">{cur.actual}</div></div>
            <div><div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Predicted</div><div className="font-display text-2xl text-destructive">{cur.predicted}</div></div>
            <div><div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Confidence</div><div className="font-mono text-xl">{(cur.conf * 100).toFixed(2)}%</div></div>
            {isLiveMode && cam && (
              <div className="text-[10px] font-mono text-muted-foreground">
                Grad-CAM layer: <span className="text-accent">{cam.layer_name}</span> | Target class: <span className="text-accent">{cam.target_class}</span>
              </div>
            )}
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Error type distribution</div>
              <ul className="space-y-1.5 text-sm">
                {dist.map(([k, n]) => (
                  <li key={k} className="flex justify-between border-b border-border/50 pb-1">
                    <span>{k}</span><span className="font-mono">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Select({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="rounded-lg border border-border bg-card p-3 text-sm block">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-transparent outline-none font-display text-lg cursor-pointer">
        <option value="all">All</option>
        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </label>
  );
}