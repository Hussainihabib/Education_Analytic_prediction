import { useEffect, useState } from "react";

export default function ChartFrame({
  children,
  title = "Chart",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-1 top-1 z-10 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur transition hover:bg-slate-50 dark:border-navy-600 dark:bg-navy-800/95 dark:text-slate-200 dark:hover:bg-navy-700"
          aria-label={`Maximize ${title}`}
          title="Maximize chart"
        >
          ⛶ Maximize
        </button>
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} maximized`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="flex h-[92vh] w-[96vw] max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-navy-600 dark:bg-navy-900">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 dark:border-navy-700">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Expanded view
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-navy-600 dark:text-slate-200 dark:hover:bg-navy-700"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-5">
              <div className="min-h-full min-w-[720px] flex items-center justify-center">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
