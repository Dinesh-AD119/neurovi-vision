import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader, StatCard } from "@/components/ui/badge-mock";

import { useEffect, useState } from "react";
import { getMode } from "@/services/predictionService";
import { getModelMetrics, getConfusionMatrix } from "@/services/modelService";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Model Performance Laboratory — NeuroVision AI" }, { name: "description", content: "Official and external accuracy, confusion matrices, per-class metrics, and Glioma weakness analysis." }] }),
  component: PerfPage,
});

const CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"] as const;
const OFFICIAL = [[325,44,25,1],[4,387,1,8],[0,0,400,0],[0,0,0,400]];
const EXTERNAL = [[281,16,3,0],[0,303,1,2],[0,0,405,0],[0,4,0,296]];

function perClass(cm: number[][]) {
  return CLASSES.map((c, i) => {
    const tp = cm[i][i];
    const fn = cm[i].reduce((a, b) => a + b, 0) - tp;
    const fp = cm.reduce((a, row) => a + row[i], 0) - tp;
    const support = tp + fn;
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1 = 2 * precision * recall / (precision + recall || 1);
    return { c, precision, recall, f1, support };
  });
}

function PerfPage() {
  const [officialCm, setOfficialCm] = useState<number[][]>(OFFICIAL);
  const [officialAccuracy, setOfficialAccuracy] = useState("94.80%");

  useEffect(() => {
    if (getMode() === "live") {
      getModelMetrics()
        .then(metrics => {
          setOfficialAccuracy(`${metrics.official.accuracy.toFixed(2)}%`);
        })
        .catch(console.error);

      getConfusionMatrix("official")
        .then(setOfficialCm)
        .catch(console.error);
    }
  }, []);

  return (
    <PageShell>
      <SectionHeader eyebrow="Performance Laboratory" title="Real metrics, honestly presented." description="Every number below is computed from the actual project confusion matrices. No fabricated ROC/AUC, no invented clinical sensitivities." />

      <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Official acc." value={officialAccuracy} sub="1,595 images" />
        <StatCard label="CNN baseline" value="90.91%" />
        <StatCard label="Xception" value="~88%" />
      </div>

      <div className="mt-12">
        <ConfusionCard title="Official confusion matrix" cm={officialCm} />
      </div>

      <div className="mt-12">
        <SectionHeader title="Per-class classification report" />
        <div className="mt-6">
          <ClassificationReport title="Official" rows={perClass(officialCm)} />
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <div className="font-display text-2xl text-destructive">Glioma weakness</div>
        <p className="mt-2 text-sm max-w-3xl">
          Glioma recall on the official test set is <b>82.28%</b>. The model most frequently confuses Glioma with Meningioma (44 cases) and No Tumor (25 cases). Interpret Glioma predictions with additional caution and always cross-reference with expert review.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-warm">
        <div className="font-display text-2xl">Dataset generalization caution</div>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          Model performance is evaluated on the testing dataset containing 1,595 images. Real-world performance on external patient populations may differ due to changes in scanner types, imaging sequences, and patient demographics (dataset shift).
        </p>
      </div>
    </PageShell>
  );
}

function ConfusionCard({ title, cm }: { title: string; cm: number[][] }) {
  const max = Math.max(...cm.flat());
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-warm">
      <div className="font-display text-xl">{title}</div>
      <div className="mt-4 overflow-x-auto">
        <table className="text-sm w-full">
          <thead>
            <tr className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <th className="p-2 text-left">Actual \\ Pred</th>
              {CLASSES.map((c) => <th key={c} className="p-2 text-center">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {cm.map((row, i) => (
              <tr key={i}>
                <td className="p-2 font-medium">{CLASSES[i]}</td>
                {row.map((v, j) => {
                  const alpha = v / max;
                  const diag = i === j;
                  return (
                    <td key={j} className="p-2 text-center">
                      <div
                        className="mx-auto flex items-center justify-center rounded-md aspect-square w-16 font-mono"
                        style={{
                          background: diag
                            ? `oklch(0.62 0.13 40 / ${0.15 + alpha * 0.7})`
                            : `oklch(0.5 0.15 25 / ${0.05 + alpha * 0.5})`,
                          color: alpha > 0.5 ? "oklch(0.98 0.008 80)" : undefined,
                        }}
                      >
                        {v}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClassificationReport({ title, rows }: { title: string; rows: ReturnType<typeof perClass> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-warm">
      <div className="font-display text-xl">{title}</div>
      <table className="mt-4 w-full text-sm">
        <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <tr><th className="text-left p-2">Class</th><th className="p-2">Precision</th><th className="p-2">Recall</th><th className="p-2">F1</th><th className="p-2">Support</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.c} className="border-t border-border/60">
              <td className="p-2 font-medium">{r.c}</td>
              <td className="p-2 text-center font-mono">{r.precision.toFixed(3)}</td>
              <td className="p-2 text-center font-mono">{r.recall.toFixed(3)}</td>
              <td className="p-2 text-center font-mono">{r.f1.toFixed(3)}</td>
              <td className="p-2 text-center font-mono">{r.support}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}