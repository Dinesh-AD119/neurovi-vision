import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "MRI Class Knowledge Center — NeuroVision AI" }, { name: "description", content: "Educational overview of Glioma, Meningioma, No Tumor, and Pituitary Tumor MRI classes." }] }),
  component: KnowledgePage,
});

const CLASSES = [
  {
    name: "Glioma",
    color: "oklch(0.62 0.13 40)",
    short: "Tumors arising from glial support cells of the brain and spinal cord.",
    body: "Gliomas range widely in aggressiveness. On MRI, appearances vary substantially with grade, edema, and location. This is the class the model most often confuses with Meningioma or No Tumor.",
  },
  {
    name: "Meningioma",
    color: "oklch(0.76 0.11 82)",
    short: "Typically slow-growing tumors originating from the meninges.",
    body: "Meningiomas are frequently well-circumscribed and dural-based. Their MRI appearance can overlap with certain gliomas, contributing to the model's cross-class confusion patterns.",
  },
  {
    name: "No Tumor",
    color: "oklch(0.52 0.06 115)",
    short: "Scans with no visible tumor identified.",
    body: "In this dataset, the model reaches 100% recall on the No Tumor class in both official and external evaluations — however, some Gliomas are mistakenly routed here, so this class must not be treated as a clinical clearance.",
  },
  {
    name: "Pituitary",
    color: "oklch(0.38 0.07 20)",
    short: "Tumors located at the pituitary gland (sella turcica).",
    body: "Pituitary tumors have a characteristic location, and the model reaches high recall on this class. Interpretation still requires expert radiological confirmation.",
  },
];

function KnowledgePage() {
  return (
    <PageShell>
      <SectionHeader eyebrow="Knowledge Center" title="Understanding the four MRI classes." description="Educational overview only. Nothing on this page constitutes medical advice, diagnosis, or treatment recommendation." />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {CLASSES.map((c) => (
          <article key={c.name} className="rounded-2xl border border-border bg-card p-6 shadow-warm relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-40 blur-2xl" style={{ background: c.color }} />
            <div className="relative">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Class</div>
              <div className="mt-1 font-display text-3xl">{c.name}</div>
              <div className="mt-2 text-primary font-medium">{c.short}</div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}