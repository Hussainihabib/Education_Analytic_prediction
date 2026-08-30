import { kpiTicker } from "../data/mockData.js";

export default function AuthLayout({ children }) {
  const ticker = kpiTicker();

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-50 dark:bg-slate-950">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-cream-100 px-14 py-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-amber-accent/10 blur-3xl" />

        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-teal-accent/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border border-amber-accent flex items-center justify-center text-amber-accent font-serif text-lg">
              EP
            </div>

            <div>
              <div className="font-serif text-xl font-semibold">
                EduPredict
              </div>

              <div className="text-[10px] tracking-[0.2em] text-slate-400 font-mono">
                BIG DATA &amp; PREDICTIVE ANALYTICS
              </div>
            </div>
          </div>

          <h1 className="font-serif text-4xl xl:text-[42px] leading-tight font-bold mt-16 max-w-md">
            Every record tells you who needs help next.
          </h1>

          <p className="text-slate-300 mt-20 max-w-md leading-relaxed">
            EduPredict turns academic records, attendance, and LMS
            activity into early warnings — so no student falls through
            the cracks unnoticed.
          </p>
        </div>

        {/* KPI Ticker */}
        <div className="relative border-t border-white/10 pt-5 space-y-3 font-mono text-sm">
          {ticker.map((t) => (
            <div
              key={t.label}
              className="flex items-center justify-between"
            >
              <span className="text-slate-400">
                {t.label}
              </span>

              <span className="text-teal-accent font-semibold">
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - AUTH CONTENT */}
      <div className="flex items-center justify-center bg-cream-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-300">
        <div className="w-full max-w-md text-slate-900 dark:text-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}