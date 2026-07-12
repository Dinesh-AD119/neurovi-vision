import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NeuroVision AI — Brain Tumor MRI Classifier" },
      { name: "description", content: "Cinematic ResNet50 four-class MRI classifier with explainability, performance analytics, and misclassification study." },
      { property: "og:title", content: "NeuroVision AI — Brain Tumor MRI Classifier" },
      { property: "og:description", content: "ResNet50 Phase-2 fine-tuned classifier for Glioma, Meningioma, No Tumor and Pituitary MRI scans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/neurovision-logo.png" },,
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" } as unknown as { rel: string; href: string },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground grain">
        <SiteHeader />
        <main className="pt-20">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/report", label: "Report" },
  { to: "/performance", label: "Performance" },
  { to: "/misclassifications", label: "Misclassifications" },
  { to: "/architecture", label: "Architecture" },
  { to: "/records", label: "Records" },
  { to: "/knowledge", label: "Knowledge" },
  { to: "/project", label: "Project" },
] as const;

import { useState } from "react";
import { getMode, setMode, checkBackendHealth } from "../services/predictionService";

function SiteHeader() {
  const [mode, setModeState] = useState<"live" | "mock">("live");
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    setModeState(getMode());

    const updateHealth = async () => {
      const currentMode = getMode();
      if (currentMode === "live") {
        const healthy = await checkBackendHealth();
        setIsHealthy(healthy);
      } else {
        setIsHealthy(null);
      }
    };

    updateHealth();
    const interval = setInterval(updateHealth, 5000);

    const handleStorage = () => {
      setModeState(getMode());
      updateHealth();
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleMode = () => {
    const next = mode === "live" ? "mock" : "live";
    setMode(next);
    setModeState(next);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 backdrop-blur-md bg-background/75">
      <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <Link to="/" className="flex items-center gap-2.5 group">
               <img
                   src="/neurovision-logo.png"
                   alt="NeuroVision AI logo"
                   className="h-10 w-10 rounded-full object-cover"
                  />
                   <span className="font-display text-xl tracking-tight">
                   NeuroVision <span className="text-primary">AI</span>
           </span>
</Link>
          
          <button
            onClick={toggleMode}
            title="Click to toggle prediction mode"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest bg-secondary/80 hover:bg-secondary cursor-pointer transition-colors"
          >
            {mode === "live" ? (
              <>
                <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-moss" : "bg-destructive animate-pulse"}`} />
                <span>Live API {isHealthy ? "" : "(Offline)"}</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span>Frontend Mock</span>
              </>
            )}
          </button>
        </div>
        
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary bg-secondary" }}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/analyze" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-warm">
          Analyze MRI
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-ivory/40">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="font-display text-xl">NeuroVision AI</div>
          <p className="mt-2 text-muted-foreground max-w-sm">
            Educational research interface for the Brain Tumor MRI Classification project.
            Not a medical device. Not for clinical diagnosis.
          </p>
        </div>
        <div>
          <div className="font-medium mb-2">Model</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>ResNet50 · Phase-2 fine-tuning</li>
            <li>Official accuracy 94.80% (1,595 test images)</li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Disclaimer</div>
          <p className="text-muted-foreground">
            All outputs are model predictions only and must not be used as medical advice or diagnosis.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © NeuroVision AI · Research prototype
      </div>
    </footer>
  );
}
