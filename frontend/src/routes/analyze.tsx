import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Disclaimer, MockBadge, PageShell, SectionHeader } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/analyze")({
  head: () => ({ meta: [{ title: "MRI Analysis Workspace — NeuroVision AI" }, { name: "description", content: "Upload an MRI scan and run the ResNet50 classifier with cinematic staged inference." }] }),
  component: AnalyzePage,
});

import { getMode, runPrediction } from "@/services/predictionService";

type Pred = { label: string; p: number };
const CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"];

function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [bright, setBright] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [stage, setStage] = useState<"idle" | "preprocess" | "forward" | "softmax" | "done">("idle");
  const [preds, setPreds] = useState<Pred[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(getMode() === "live");
  const inputRef = useRef<HTMLInputElement>(null);

  // Monitor mode selection
  useState(() => {
    const checkMode = () => setIsLiveMode(getMode() === "live");
    window.addEventListener("storage", checkMode);
    return () => window.removeEventListener("storage", checkMode);
  });

  const accept = "image/jpeg,image/jpg,image/png";

  const handleFiles = useCallback((f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(f.type)) return;
    const u = URL.createObjectURL(f);
    setFile(f); setUrl(u); setPreds(null); setStage("idle"); setError(null);
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = u;
  }, []);

  const runInference = async () => {
    if (!file) return;
    setPreds(null);
    setError(null);
    
    const activeMode = getMode();

    if (activeMode === "mock") {
      const stages: typeof stage[] = ["preprocess", "forward", "softmax", "done"];
      for (const s of stages) {
        setStage(s);
        await new Promise((r) => setTimeout(r, s === "forward" ? 1100 : 600));
      }
      const raw = [Math.random() * 0.4 + 0.05, Math.random() * 0.4 + 0.05, Math.random() * 0.4 + 0.05, Math.random() * 0.4 + 0.05];
      const top = Math.floor(Math.random() * 4);
      raw[top] = 0.72 + Math.random() * 0.24;
      const sum = raw.reduce((a, b) => a + b, 0);
      const normed: Pred[] = CLASSES.map((c, i) => ({ label: c, p: raw[i] / sum })).sort((a, b) => b.p - a.p);
      setPreds(normed);
      localStorage.removeItem("latest_prediction"); // Remove any live run when mock is active
    } else {
      try {
        // Kick off request
        const apiPromise = runPrediction(file);

        // Ceremony visual progress
        setStage("preprocess");
        await new Promise((r) => setTimeout(r, 600));
        
        setStage("forward");
        await new Promise((r) => setTimeout(r, 1100));
        
        setStage("softmax");
        
        // Wait for actual API response
        const res = await apiPromise;
        
        setStage("done");
        await new Promise((r) => setTimeout(r, 600));

        // Format prediction array
        const sorted = res.probabilities.map(p => ({
          label: p.display_name,
          p: p.probability / 100.0
        })).sort((a, b) => b.p - a.p);

        setPreds(sorted);
        localStorage.setItem("latest_prediction", JSON.stringify(res));
      } catch (err: any) {
        setStage("idle");
        setError(err.message || "Failed to communicate with live API backend.");
      }
    }
  };

  const reset = () => { setBright(100); setContrast(100); setZoom(1); setRot(0); };
  const remove = () => { setFile(null); setUrl(null); setDims(null); setPreds(null); setStage("idle"); setError(null); };

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader 
          eyebrow="Workspace" 
          title="MRI Analysis Workspace" 
          description={isLiveMode 
            ? "Upload a T1 MRI scan to run real-time inference using the fine-tuned ResNet50 model loaded directly on our Python FastAPI backend." 
            : "Preview the upload workspace in mock mode. Predictions are randomly generated for client-side demo purposes only."} 
        />
        <div className="flex gap-2">
          {isLiveMode ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest bg-moss/20 text-moss border-moss/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Live Mode Active
            </span>
          ) : (
            <MockBadge>Predictions are frontend mock</MockBadge>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive font-medium flex items-center justify-between">
          <span>⚠ Connection Error: {error}</span>
          <button onClick={() => setError(null)} className="text-xs uppercase tracking-wider underline cursor-pointer hover:opacity-80">Dismiss</button>
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        {/* Chamber */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-warm">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-cinema">
            {!url ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files?.[0] ?? null); }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => handleFiles(e.target.files?.[0] ?? null)} />
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-accent/50 flex items-center justify-center animate-pulse-glow">
                  <span className="font-display text-3xl text-accent">+</span>
                </div>
                <div className="mt-4 font-display text-2xl text-ivory">Drop MRI here</div>
                <div className="mt-1 text-xs font-mono uppercase tracking-widest text-accent/70">JPG · JPEG · PNG</div>
              </label>
            ) : (
              <>
                <img
                  src={url}
                  alt="uploaded MRI"
                  className="absolute inset-0 h-full w-full object-contain transition-transform"
                  style={{ filter: `brightness(${bright}%) contrast(${contrast}%)`, transform: `scale(${zoom}) rotate(${rot}deg)` }}
                />
                {stage !== "idle" && stage !== "done" && (
                  <div className="absolute inset-x-4 top-0 h-20 animate-mri-sweep" style={{ background: "var(--gradient-scan)" }} />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <button onClick={remove} className="px-2 py-1 rounded bg-black/40 text-ivory text-xs">Remove</button>
                  <button onClick={() => inputRef.current?.click()} className="px-2 py-1 rounded bg-black/40 text-ivory text-xs">Replace</button>
                  <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => handleFiles(e.target.files?.[0] ?? null)} />
                </div>
                {stage !== "idle" && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-accent">
                    <span>{stage === "done" ? "Inference complete" : `Stage · ${stage}`}</span>
                    <span>224×224</span>
                  </div>
                )}
              </>
            )}
          </div>

          {url && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Slider label="Brightness" v={bright} set={setBright} min={50} max={150} />
              <Slider label="Contrast" v={contrast} set={setContrast} min={50} max={150} />
              <Slider label="Zoom" v={Math.round(zoom * 100)} set={(v) => setZoom(v / 100)} min={50} max={300} />
              <Slider label="Rotate" v={rot} set={setRot} min={-180} max={180} suffix="°" />
              <button onClick={reset} className="col-span-2 mt-1 py-2 rounded-md border border-border hover:bg-secondary text-sm">Reset viewer</button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">File</div>
            <div className="mt-2 font-display text-xl truncate">{file?.name ?? "No file selected"}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "—"}{dims ? ` · ${dims.w}×${dims.h}` : ""}
            </div>
            <button
              disabled={!url || (stage !== "idle" && stage !== "done")}
              onClick={runInference}
              className="mt-5 w-full py-3 rounded-md bg-primary text-primary-foreground font-medium shadow-warm disabled:opacity-40 hover:opacity-90 transition cursor-pointer"
            >
              {stage === "idle" || stage === "done" ? "Run Prediction" : "Analyzing…"}
            </button>
            <div className="mt-3">
              {isLiveMode ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-moss">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Live backend API inference
                </span>
              ) : (
                <MockBadge>Mock inference · UI ceremony only</MockBadge>
              )}
            </div>
          </div>

          {preds && <PredictionCard preds={preds} />}
        </div>
      </div>

      <div className="mt-10"><Disclaimer /></div>
    </PageShell>
  );
}


function Slider({ label, v, set, min, max, suffix }: { label: string; v: number; set: (n: number) => void; min: number; max: number; suffix?: string }) {
  return (
    <label className="block">
      <div className="flex justify-between text-xs text-muted-foreground font-mono uppercase tracking-widest"><span>{label}</span><span>{v}{suffix ?? "%"}</span></div>
      <input type="range" min={min} max={max} value={v} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full accent-[oklch(0.62_0.13_40)]" />
    </label>
  );
}

function confidenceLevel(p: number) {
  if (p >= 0.95) return { label: "Very High", tone: "text-moss" };
  if (p >= 0.85) return { label: "High", tone: "text-accent" };
  if (p >= 0.70) return { label: "Moderate", tone: "text-amber" };
  return { label: "Low", tone: "text-destructive" };
}

function PredictionCard({ preds }: { preds: Pred[] }) {
  const top = preds[0]; const lvl = confidenceLevel(top.p);
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-warm">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Top-1 Prediction</div>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="font-display text-3xl">{top.label}</div>
        <div className="font-mono text-2xl text-primary">{(top.p * 100).toFixed(2)}%</div>
      </div>
      <div className={`mt-1 text-sm font-medium ${lvl.tone}`}>Confidence · {lvl.label}</div>
      <div className="mt-5 space-y-2.5">
        {preds.map((p, i) => (
          <div key={p.label}>
            <div className="flex justify-between text-xs text-muted-foreground"><span>{i + 1}. {p.label}</span><span className="font-mono">{(p.p * 100).toFixed(2)}%</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-warm" style={{ width: `${p.p * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}