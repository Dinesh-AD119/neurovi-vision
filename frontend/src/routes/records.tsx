import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getMode } from "@/services/predictionService";
import { getAllRecords, deleteRecord } from "@/services/recordService";
import { MockBadge, PageShell, SectionHeader } from "@/components/ui/badge-mock";

export const Route = createFileRoute("/records")({
  head: () => ({ meta: [{ title: "Analysis Records — NeuroVision AI" }, { name: "description", content: "History of analyses with search, filters, and export." }] }),
  component: RecordsPage,
});

const CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"] as const;
type C = typeof CLASSES[number];

type RecordType = { id: string; file: string; predicted: C; conf: number; at: number };

const MOCK: RecordType[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `rec-${1000 + i}`,
  file: `mri_${(i + 1).toString().padStart(3, "0")}.jpg`,
  predicted: CLASSES[i % 4],
  conf: 0.55 + Math.random() * 0.44,
  at: Date.now() - i * 3600_000 * (1 + Math.random()),
}));

function RecordsPage() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<"all" | C>("all");
  const [records, setRecords] = useState<RecordType[]>(MOCK);
  const [isLiveMode, setIsLiveMode] = useState(getMode() === "live");

  useEffect(() => {
    const activeMode = getMode();
    setIsLiveMode(activeMode === "live");
    if (activeMode === "live") {
      getAllRecords()
        .then(data => {
          const formatted = data.map(r => ({
            id: r.analysis_id,
            file: r.original_filename,
            predicted: r.display_name as C,
            conf: r.confidence / 100.0,
            at: new Date(r.timestamp).getTime()
          }));
          setRecords(formatted);
        })
        .catch(console.error);
    }
  }, []);

  const filtered = useMemo(() =>
    records.filter(r => (cls === "all" || r.predicted === cls) && r.file.toLowerCase().includes(q.toLowerCase())),
    [records, q, cls]);

  const dist = useMemo(() => {
    const map = new Map<C, number>();
    records.forEach(r => map.set(r.predicted, (map.get(r.predicted) ?? 0) + 1));
    return CLASSES.map(c => ({ c, n: map.get(c) ?? 0 }));
  }, [records]);
  const avg = records.reduce((s, r) => s + r.conf, 0) / (records.length || 1);

  const handleDelete = async (id: string) => {
    if (isLiveMode) {
      try {
        await deleteRecord(id);
        setRecords(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error("Delete record failed:", err);
      }
    } else {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <PageShell>
      <div className="flex justify-between flex-wrap gap-4 items-start">
        <SectionHeader eyebrow="Analysis Records" title="Every scan you've analyzed — auditable and exportable." description="No patient names, no PHI. Only the technical trail of predictions." />
        <div className="flex gap-2">
          {isLiveMode ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest bg-moss/20 text-moss border-moss/40">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Live API Records
            </span>
          ) : (
            <MockBadge>Local mock records</MockBadge>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total</div>
          <div className="mt-1 font-display text-3xl text-gradient-warm">{records.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Avg confidence</div>
          <div className="mt-1 font-display text-3xl text-gradient-warm">{(avg * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 col-span-2">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Class distribution</div>
          <div className="flex gap-1.5 items-end h-14">
            {dist.map((d) => (
              <div key={d.c} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-gradient-warm" style={{ height: `${(d.n / Math.max(...dist.map(x => x.n), 1)) * 100}%` }} />
                <div className="text-[10px] font-mono text-muted-foreground">{d.c.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search filename…" className="flex-1 min-w-[240px] px-3 py-2 rounded-md border border-border bg-card outline-none focus:ring-2 focus:ring-primary/40" />
        <select value={cls} onChange={(e) => setCls(e.target.value as "all" | C)} className="px-3 py-2 rounded-md border border-border bg-card cursor-pointer">
          <option value="all">All classes</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden shadow-warm">
        <table className="w-full text-sm">
          <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-secondary/50">
            <tr><th className="text-left p-3">File</th><th className="p-3">Predicted</th><th className="p-3">Confidence</th><th className="p-3">Time</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border/50 hover:bg-secondary/30">
                <td className="p-3 font-mono text-xs">{r.file}</td>
                <td className="p-3 text-center">{r.predicted}</td>
                <td className="p-3 text-center font-mono">{(r.conf * 100).toFixed(2)}%</td>
                <td className="p-3 text-center text-muted-foreground text-xs">{new Date(r.at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-destructive hover:underline cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No records match.</td></tr>}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}