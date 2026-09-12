import React, { useEffect, useState } from "react";
import { Crown, Trash2, Smartphone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import usePremium from "@/hooks/usePremium";
import DeleteAccountDialog from "@/components/settings/DeleteAccountDialog";

export default function SettingsTab() {
  const [user, setUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { premium } = usePremium();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Account */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 select-none place-items-center rounded-full bg-gradient-to-br from-cyan-400 via-purple-600 to-fuchsia-500 text-lg font-black text-white">
            {(user?.email?.[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.email || "Signed in"}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
              <Crown className={`h-3.5 w-3.5 ${premium ? "text-fuchsia-300" : ""}`} />
              {premium ? "Premium member" : "Free plan"}
            </p>
          </div>
        </div>
      </div>

      {/* General */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <Link
          to="/app-icon"
          className="flex select-none items-center gap-3 p-5 text-sm text-white/80 transition-colors hover:text-white"
        >
          <Smartphone className="h-5 w-5 text-cyan-300" />
          Download the app icon
          <ChevronRight className="ml-auto h-4 w-4 text-white/30" />
        </Link>
      </div>

      {/* Danger zone */}
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6">
        <h3 className="flex select-none items-center gap-2 text-sm font-bold text-white">
          <Trash2 className="h-4 w-4 text-rose-400" /> Delete Account
        </h3>
        <p className="mt-2 text-xs text-white/50">
          Permanently deletes all your wallpapers and signs you out. This cannot be undone.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-4 w-full rounded-xl border border-rose-500/30 bg-rose-500/15 py-3 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/25"
        >
          Delete Account
        </button>
      </div>

      <DeleteAccountDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
    </div>
  );
}