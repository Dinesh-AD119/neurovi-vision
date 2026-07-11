import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Disclaimer, MockBadge, PageShell, SectionHeader } from "@/components/ui/badge-mock";
import { getMode } from "@/services/predictionService";
import { getRecordDetail } from "@/services/recordService";
import { getGradCam } from "@/services/gradcamService";
import { PredictionResponse, GradCamResponse } from "@/types/api";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "AI Analysis Report — NeuroVision AI" }, { name: "description", content: "Predicted class, confidence band, Top-2 margin, uncertainty flag, and Grad-CAM explainability studio." }] }),
  component: ReportPage,
});

const MOCK_REPORT = {
  timestamp: new Date().toISOString(),
  model: "07_resnet50_phase2_final.keras",
  predicted: "Glioma",
  probs: [
    { label: "Glioma", p: 0.7423 },
    { label: "Meningioma", p: 0.1892 },
    { label: "No Tumor", p: 0.0421 },
    { label: "Pituitary", p: 0.0264 },
  ],
};

function ReportPage() {
  const [latestPred, setLatestPred] = useState<PredictionResponse | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(getMode() === "live");

  useEffect(() => {
    const activeMode = getMode();
    setIsLiveMode(activeMode === "live");
    if (activeMode === "live") {
      const saved = localStorage.getItem("latest_prediction");
      if (saved) {
        try {
          setLatestPred(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse latest prediction:", e);
        }
      }
    }
  }, []);

  // Set values based on mode
  const activePred = isLiveMode && latestPred ? latestPred : null;

  const timestamp = activePred ? activePred.timestamp : MOCK_REPORT.timestamp;
  const modelName = activePred ? activePred.model.name : MOCK_REPORT.model;
  const predictedClass = activePred ? activePred.display_name : MOCK_REPORT.predicted;
  
  const sorted = activePred 
    ? [...activePred.probabilities]
        .map(p => ({ label: p.display_name, p: p.probability / 100.0 }))
        .sort((a, b) => b.p - a.p)
    : [...MOCK_REPORT.probs].sort((a, b) => b.p - a.p);

  const top1 = sorted[0]; 
  const top2 = sorted[1];
  const margin = top1.p - top2.p;
  const level = activePred ? activePred.confidence_level : (top1.p >= 0.95 ? "Very High" : top1.p >= 0.85 ? "High" : top1.p >= 0.70 ? "Moderate" : "Low");
  const uncertain = activePred ? activePred.uncertainty_warning : (top1.p < 0.7 || margin < 0.15);

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader eyebrow="AI Analysis Report" title="A single MRI, told in full transparency." description="Predicted class, confidence, Top-2 margin, uncertainty flag, and Grad-CAM attention — printable and exportable." />
        <div className="flex gap-2">
          {isLiveMode && activePred ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest bg-moss/20 text-moss border-moss/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Live Report Active
            </span>
          ) : (
            <MockBadge>Sample report</MockBadge>
          )}
          <button onClick={() => window.print()} className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary cursor-pointer">Print / Export</button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-warm">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Predicted class</div>
          <div className="mt-1 font-display text-4xl text-gradient-warm">{predictedClass}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Meta k="Confidence" v={`${(top1.p * 100).toFixed(2)}%`} />
            <Meta k="Level" v={level} />
            <Meta k="Top-2" v={top2.label} />
            <Meta k="Margin" v={`${(margin * 100).toFixed(2)}%`} />
            <Meta k="Model" v={modelName} />
            <Meta k="Time" v={new Date(timestamp).toLocaleString()} />
          </div>
          {uncertain && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              ⚠ Low-confidence or narrow-margin prediction. Interpret with additional caution.
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-warm">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">All-class probabilities</div>
          <div className="mt-4 space-y-3">
            {sorted.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-sm"><span>{p.label}</span><span className="font-mono">{(p.p * 100).toFixed(2)}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-warm" style={{ width: `${p.p * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <SectionHeader eyebrow="Grad-CAM Explainability Studio" title="Model attention — not tumor localization." description="Grad-CAM shows the image regions that most influenced the ResNet50 prediction. It does not delineate tumor boundaries or provide clinical segmentation." />
        <div className="mt-4">
          {isLiveMode && activePred ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest bg-moss/20 text-moss border-moss/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Real Grad-CAM Loaded
            </span>
          ) : (
            <MockBadge tone="crimson">Heatmap placeholder — awaits real backend</MockBadge>
          )}
        </div>
        <GradCamStudio analysisId={activePred?.analysis_id} isLive={isLiveMode && !!activePred} />
      </div>

      <div className="mt-10"><Disclaimer /></div>
    </PageShell>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function GradCamStudio({ analysisId, isLive }: { analysisId?: string; isLive: boolean }) {
  const [opacity, setOpacity] = useState(60);
  const [split, setSplit] = useState(50);
  const [camData, setCamData] = useState<GradCamResponse | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isLive && analysisId) {
      setLoading(true);
      setErr(null);
      getRecordDetail(analysisId)
        .then(detail => {
          setOriginalImage(detail.image_data_b64);
          return getGradCam(analysisId);
        })
        .then(cam => {
          setCamData(cam);
        })
        .catch(error => {
          console.error(error);
          setErr("Grad-CAM visualization is currently unavailable for this analysis.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCamData(null);
      setOriginalImage(null);
    }
  }, [isLive, analysisId]);

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-warm">
      {err && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}
      
      {loading && (
        <div className="mb-4 p-8 text-center text-accent animate-pulse font-mono text-sm">
          Generating Grad-CAM heatmap via TensorFlow gradients...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(["Original", "Heatmap", "Overlay"] as const).map((label, idx) => (
          <div key={label} className="relative aspect-square rounded-xl overflow-hidden bg-cinema border border-border">
            {isLive ? (
              // Live image display
              idx === 0 && originalImage ? (
                <img src={originalImage} className="absolute inset-0 h-full w-full object-cover" alt="original mri" />
              ) : idx === 1 && camData?.heatmap ? (
                <img src={camData.heatmap} className="absolute inset-0 h-full w-full object-cover" alt="heatmap" />
              ) : idx === 2 && camData?.overlay ? (
                <img src={camData.overlay} className="absolute inset-0 h-full w-full object-cover" alt="overlay" style={{ opacity: opacity / 100 }} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-mono">Loading...</div>
              )
            ) : (
              // Mock display
              <FauxBrain intensity={idx === 1 ? 1 : idx === 2 ? opacity / 100 : 0} showBase={idx !== 1} />
            )}
            <div className="absolute top-2 left-2 text-[10px] font-mono uppercase tracking-widest text-accent bg-black/40 px-1 rounded">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <div className="flex justify-between text-xs text-muted-foreground font-mono uppercase tracking-widest"><span>Overlay opacity</span><span>{opacity}%</span></div>
          <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1 w-full accent-[oklch(0.62_0.13_40)]" />
        </label>
        <label className="block text-sm">
          <div className="flex justify-between text-xs text-muted-foreground font-mono uppercase tracking-widest"><span>Comparison slider</span><span>{split}%</span></div>
          <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} className="mt-1 w-full accent-[oklch(0.62_0.13_40)]" />
        </label>
      </div>
      {isLive && camData && (
        <div className="mt-4 text-xs font-mono text-muted-foreground">
          Grad-CAM layer target: <span className="text-accent">{camData.layer_name}</span> | Computed for class: <span className="text-accent">{camData.target_class}</span>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary cursor-pointer">Fullscreen</button>
        <button className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary cursor-pointer">Zoom / Pan</button>
        <button 
          onClick={() => {
            const link = document.createElement("a");
            link.href = camData?.overlay || "";
            link.download = `gradcam_overlay_${analysisId}.jpg`;
            if (camData?.overlay) link.click();
          }}
          disabled={!camData?.overlay}
          className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary cursor-pointer disabled:opacity-40"
        >
          Download overlay
        </button>
      </div>
    </div>
  );
}

function FauxBrain({ intensity, showBase }: { intensity: number; showBase: boolean }) {
  return (
    <div className="absolute inset-0">
      {showBase && (
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-ivory/60">
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx="100" cy="100" rx={30 + i * 8} ry={22 + i * 7} fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.7 - i * 0.08} />
          ))}
        </svg>
      )}
      <div className="absolute inset-0" style={{ opacity: intensity, background: "radial-gradient(circle at 55% 45%, oklch(0.62 0.13 40 / 0.85) 0%, oklch(0.76 0.11 82 / 0.5) 30%, transparent 60%)" }} />
    </div>
  );
}