import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

const ERRATA_URL = "/assets/errata.pdf";

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function Errata() {
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLastModified() {
      setError(null);

      try {
        // Cache-bust to avoid CDN/browser caching hiding fresh updates
        const bust = `?v=${Date.now()}`;

        // Try cheap HEAD first
        let res = await fetch(`${ERRATA_URL}${bust}`, {
          method: "HEAD",
          cache: "no-store",
        });

        // Some hosts don’t allow HEAD; fall back to a minimal GET (1 byte)
        if (!res.ok || !res.headers.get("last-modified")) {
          res = await fetch(`${ERRATA_URL}${bust}`, {
            method: "GET",
            headers: { Range: "bytes=0-0" },
            cache: "no-store",
          });
        }

        const lm = res.headers.get("last-modified");
        if (!lm) throw new Error("Missing Last-Modified header for errata.pdf");

        const date = new Date(lm);
        if (Number.isNaN(date.getTime()))
          throw new Error("Invalid Last-Modified date");

        if (!cancelled) setLastModified(date);
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message ?? "Failed to detect last update time");
      }
    }

    loadLastModified();
    return () => {
      cancelled = true;
    };
  }, []);

  const daysAgo = useMemo(() => {
    if (!lastModified) return null;
    const now = new Date();
    const ms = now.getTime() - lastModified.getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }, [lastModified]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DarkModeToggle />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-400 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Errata
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The PDF below lists corrections and updates to the book and points out
          the errata.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <a
            href={ERRATA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            {/* PDF logo (icon) */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <FileText className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                  Errata PDF
                </p>
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                  PDF
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Open the latest list of corrections.
              </p>
            </div>

            <div className="text-sm font-medium text-orange-600 group-hover:underline dark:text-orange-400">
              Open
            </div>
          </a>

          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {lastModified ? (
                <>
                  Last updated:{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDate(lastModified)}
                  </span>
                  {daysAgo !== null && (
                    <span className="ml-2 text-slate-500 dark:text-slate-500">
                      ({daysAgo} day{daysAgo === 1 ? "" : "s"} ago)
                    </span>
                  )}
                </>
              ) : error ? (
                <>
                  Last updated:{" "}
                  <span className="text-rose-600 dark:text-rose-400">
                    {error}
                  </span>
                </>
              ) : (
                <>Last updated: loading…</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
