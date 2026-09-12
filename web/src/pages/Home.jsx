import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, Images, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import StarfieldBackground from "@/components/StarfieldBackground";
import GenerateForm from "@/components/GenerateForm";
import WallpaperCard from "@/components/WallpaperCard";
import PremiumUpsell from "@/components/PremiumUpsell";
import BottomTabs from "@/components/BottomTabs";
import PullToRefresh from "@/components/PullToRefresh";
import SettingsTab from "@/components/settings/SettingsTab";
import usePremium from "@/hooks/usePremium";
import useNativeAds from "@/hooks/useNativeAds";
import { Image } from "@/components/ui/image";

const HERO_IMAGE = "https://media.base44.com/images/public/6aa369ba2c367cb07295ceae/9fbacdf2f_generated_image.png";

export default function Home() {
  // Tab state lives in the URL (?tab=...) so the Android hardware back button
  // traverses previously visited tabs before exiting the app
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "create";
  const setTab = useCallback(
    (next) => setSearchParams(next ? { tab: next } : {}),
    [setSearchParams]
  );
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { premium, refresh: refreshPremium } = usePremium();
  // Native AdMob: anchored adaptive banner for free users (0 on the website;
  // premium users never see ads)
  const bannerHeight = useNativeAds(premium);

  const loadWallpapers = useCallback(async () => {
    try {
      const list = await base44.entities.Wallpaper.list("-created_date", 50);
      setWallpapers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallpapers();
  }, [loadWallpapers]);

  // Scroll back to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const handleCreated = (record) => {
    setWallpapers((prev) => [record, ...prev]);
  };

  const handleDelete = (id) => {
    setWallpapers((prev) => prev.filter((w) => w.id !== id));
  };

  const handleRestore = (record) => {
    setWallpapers((prev) => [record, ...prev]);
  };

  const handleToggleFav = (updated) => {
    setWallpapers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const goToPremium = () => {
    setTab("create");
    setTimeout(() => {
      document.getElementById("premium")?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  const visible = filter === "favorites" ? wallpapers.filter((w) => w.is_favorite) : wallpapers;

  return (
    <div className="min-h-screen text-white" style={{ paddingTop: bannerHeight }}>
      <StarfieldBackground />

      {/* Header */}
      <header
        style={{ top: bannerHeight }}
        className="sticky z-30 border-b border-white/5 bg-[#050510]/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo size="sm" />
          {tab !== "create" && (
            <button
              onClick={() => setTab("create")}
              className="select-none rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Start Creating
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6">
        <AnimatePresence mode="wait">
        {tab === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Hero */}
            <section className="relative pt-10 sm:pt-16">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className="text-center lg:text-left">
                  <div className="mb-5 flex justify-center lg:justify-start">
                    <Logo size="xl" />
                  </div>
                  <h1
                    className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
                    style={{ textShadow: "0 0 30px rgba(138,43,226,0.5)" }}
                  >
                    Imagine.
                    <br />
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)" }}
                    >
                      Create. Masterpiece.
                    </span>
                  </h1>
                  <p className="mx-auto mt-5 max-w-md text-sm text-white/60 lg:mx-0 sm:text-base">
                    Turn a single thought into a breathtaking wallpaper. Our AI crafts
                    one-of-a-kind, phone-ready art in seconds.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                    <button
                      onClick={() => document.getElementById("create")?.scrollIntoView({ behavior: "smooth" })}
                      className="select-none rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.03]"
                      style={{
                        background: "linear-gradient(135deg, #00E5FF, #8A2BE2, #FF00FF)",
                        boxShadow: "0 0 24px rgba(138,43,226,0.5)"
                      }}
                    >
                      Generate Now
                    </button>
                    <button
                      onClick={() => setTab("gallery")}
                      className="select-none rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
                    >
                      View Gallery
                    </button>
                  </div>
                </div>

                {/* Hero image */}
                <div className="relative mx-auto max-w-sm">
                  <div
                    className="absolute -inset-4 rounded-[2rem] opacity-50 blur-2xl"
                    style={{ background: "linear-gradient(135deg, #8A2BE2, #00E5FF, #FF00FF)" }}
                  />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_0_50px_rgba(138,43,226,0.4)]">
                    <Image
                      src={HERO_IMAGE}
                      alt="Masterpiece Wallpaper AI hero"
                      fittingType="fill"
                      className="aspect-[9/16] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2 backdrop-blur-md">
                      <Sparkles className="h-4 w-4 text-cyan-300" />
                      <span className="text-xs text-white/80">AI Crafted. Limitless Imagination.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Create section */}
            <section id="create" className="scroll-mt-20 py-12 sm:py-16">
              <div className="mx-auto max-w-xl">
                <GenerateForm onCreated={handleCreated} premium={premium} onUpgrade={goToPremium} />
              </div>
            </section>

            {/* Premium */}
            <section id="premium" className="scroll-mt-20 pb-4">
              <PremiumUpsell premium={premium} onSubscribed={refreshPremium} />
            </section>
          </motion.div>
        )}

        {tab === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
          <PullToRefresh onRefresh={loadWallpapers}>
            <section id="gallery" className="scroll-mt-20 pt-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Images className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-xl font-bold tracking-wide">Your Gallery</h2>
                  <span className="select-none rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60">
                    {wallpapers.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`select-none rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                      filter === "all"
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("favorites")}
                    className={`flex select-none items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                      filter === "favorites"
                        ? "bg-fuchsia-500/20 text-white"
                        : "bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5" /> Favorites
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-4 overscroll-y-none sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[9/16] animate-pulse rounded-2xl bg-white/5" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-16 text-center">
                  <Sparkles className="mb-3 h-8 w-8 text-fuchsia-400/60" />
                  <p className="text-sm text-white/50">
                    {filter === "favorites"
                      ? "No favorites yet. Tap the heart on a wallpaper to save it here."
                      : "No wallpapers yet. Create your first masterpiece in the Create tab."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 overscroll-y-none sm:grid-cols-3 lg:grid-cols-4">
                  {visible.map((w) => (
                    <WallpaperCard
                      key={w.id}
                      wallpaper={w}
                      onDelete={handleDelete}
                      onRestore={handleRestore}
                      onToggleFav={handleToggleFav}
                      premium={premium}
                      onUpgrade={goToPremium}
                    />
                  ))}
                </div>
              )}
            </section>
          </PullToRefresh>
          </motion.div>
        )}

        {tab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <section className="pt-6">
              <SettingsTab />
            </section>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-xs tracking-[0.3em] text-white/30">
            MASTERPIECE · WALLPAPER AI
          </p>
          <p className="mt-2 text-xs text-white/20">Imagine it. AI creates it.</p>
          <p className="mt-3 text-xs">
            <Link
              to="/app-icon"
              className="text-cyan-300/70 underline underline-offset-4 transition-colors hover:text-cyan-300"
            >
              Download the app icon
            </Link>
          </p>
        </footer>
      </main>

      {/* Fixed bottom tab navigation */}
      <BottomTabs active={tab} onChange={setTab} />
    </div>
  );
}