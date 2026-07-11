import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/project")({
  head: () => ({ meta: [{ title: "Project & Research — NeuroVision AI" }, { name: "description", content: "Problem, dataset, experiments, evaluation, limitations, ethics, and technology stack." }] }),
  component: ProjectPage,
});

const SECTIONS = [
  { k: "Problem", d: "Automated four-class classification of brain MRI scans into Glioma, Meningioma, No Tumor, and Pituitary." },
  { k: "Objective", d: "Build a transparent research prototype with strong per-class performance and honest failure reporting." },
  { k: "Dataset structure", d: "Training and testing splits organized by class. Official test split contains 1,595 images." },
  { k: "Preprocessing", d: "Resize to 224×224 RGB, processing raw float32 values [0, 255]. ResNet50 preprocess_input() is embedded in the saved model graph." },
  { k: "Experiments", d: "Baseline CNN (~90.91%), Xception (~88%), and ResNet50 with two-phase fine-tuning (94.80% official test accuracy)." },
  { k: "Training strategy", d: "Phase-1: frozen backbone, train dense classification head. Phase-2: unfreeze last 50 base layers, fine-tune with Adam lr 1e-5, sparse categorical crossentropy, EarlyStopping and ModelCheckpoint." },
  { k: "Evaluation", d: "Confusion matrices and per-class precision / recall / F1-score computed on the official test set (1,595 images)." },
  { k: "Known failures", d: "Glioma recall 82.28%. The model most frequently confuses Glioma with Meningioma and No Tumor." },
  { k: "Limitations", d: "Four-class classification only; no segmentation; no clinical validation; performance is dataset-bound." },
  { k: "Ethics", d: "Not a medical device. No patient identifying information is processed. Must not replace radiologists. Grad-CAM must be described as model attention, not tumor localization." },
  { k: "Future work", d: "Richer clinical validation, robustness studies, uncertainty calibration, and real-time inference optimization." },
  { k: "Technology stack", d: "TensorFlow / Keras for the model. React + TanStack Router + Vite for this interface. FastAPI for the backend server." },
];

function ProjectPage() {
  return (
    <PageShell>
      <SectionHeader eyebrow="Project & Research" title="The complete picture — problem, method, evidence, limitations." />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <section key={s.k} className="rounded-2xl border border-border bg-card p-6 shadow-warm">
            <div className="text-xs font-mono uppercase tracking-widest text-primary">{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-1 font-display text-2xl">{s.k}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}