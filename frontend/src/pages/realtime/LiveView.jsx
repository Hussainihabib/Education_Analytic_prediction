import { useEffect, useState, useCallback, useRef } from "react";
import { apiErrorMessage } from "../../utils/validation";

import StatCard from "../../components/StatCard.jsx";
import { getDashboardStates } from "../../api/dashboardApi";
import { getMyNotifications, getAllNotifications } from "../../api/api";
import { useAuth } from "../../context/AuthContext.jsx";

const POLL_INTERVAL_MS = 15000;

// NOTE: The backend has no WebSocket / push-based streaming endpoint,
// so this page polls real REST endpoints on an interval instead of
// simulating numbers with Math.random(). Every value shown here comes
// from the live MongoDB-backed API — it will only move when real
// records change (attendance, students, notifications, etc.).

export default function LiveView() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [stats, setStats] = useState(null);
  const [feed, setFeed] = useState([]);

  const timerRef = useRef(null);

  const loadOnce = useCallback(async () => {
    try {
      setError("");

      const [statsRes, notifRes] = await Promise.all([
        getDashboardStates(),
        isAdmin ? getAllNotifications() : getMyNotifications(),
      ]);

      setStats(statsRes || null);

      const sorted = [...(notifRes || [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setFeed(sorted.slice(0, 20));

      setLastUpdated(new Date());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadOnce();
  }, [loadOnce]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    timerRef.current = setInterval(loadOnce, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, loadOnce]);

  if (loading) {
    return <div className="text-center py-10">Loading live data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-4 flex items-center gap-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            autoRefresh ? "bg-teal-accent live-dot" : "bg-slate-400"
          }`}
        />
        <span className="text-sm font-medium">
          {autoRefresh
            ? `Live — refreshing every ${POLL_INTERVAL_MS / 1000}s`
            : "Paused"}
        </span>
        {lastUpdated && (
          <span className="text-xs text-slate-400">
            Last updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={loadOnce} className="btn-secondary">
            Refresh Now
          </button>
          <button
            onClick={() => setAutoRefresh((a) => !a)}
            className="btn-secondary"
          >
            {autoRefresh ? "Pause auto-refresh" : "Resume auto-refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={(stats?.active_students ?? 0).toLocaleString()}
          icon="●"
          tone="good"
        />
        <StatCard
          label="Active Teachers"
          value={(stats?.active_teachers ?? 0).toLocaleString()}
          icon="◈"
        />
        <StatCard
          label="Attendance Records"
          value={(stats?.total_attendance ?? 0).toLocaleString()}
          icon="◷"
        />
        <StatCard
          label="Results on File"
          value={(stats?.total_results ?? 0).toLocaleString()}
          icon="▦"
        />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-3">
          {isAdmin ? "Live Notification Stream (All Users)" : "Your Live Notifications"}
        </h3>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {feed.length === 0 && (
            <p className="text-sm text-slate-400">
              No notifications yet. New academic alerts will appear here
              automatically as they are generated.
            </p>
          )}
          {feed.map((n) => (
            <div
              key={n.notification_id}
              className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-700/40"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  n.is_read ? "bg-slate-300" : "bg-teal-accent"
                }`}
              />
              <span className="font-medium">{n.title}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {n.message}
              </span>
              {isAdmin && (
                <span className="text-xs font-mono text-slate-400">
                  {n.receiver_email}
                </span>
              )}
              <span className="ml-auto text-xs text-slate-400">
                {n.created_at
                  ? new Date(n.created_at).toLocaleTimeString()
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
