import React, { useState } from "react";
import { Heart, Download, Trash2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import AdGateModal from "@/components/AdGateModal";
import nativeAds from "@/lib/nativeAds";

export default function WallpaperCard({ wallpaper, onDelete, onRestore, onToggleFav, premium, onUpgrade }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!premium) {
      setAdOpen(true); // free users watch a video ad before downloading
      return;
    }
    doDownload();
  };

  const doDownload = () => {
    const a = document.createElement("a");
    a.href = wallpaper.image_url;
    a.download = `${wallpaper.title || "masterpiece-wallpaper"}.png`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Downloading wallpaper" });
  };

  const handleDelete = async () => {
    // Optimistic: remove from the UI immediately, restore if the request fails
    onDelete?.(wallpaper.id);
    try {
      await base44.entities.Wallpaper.delete(wallpaper.id);
      toast({ title: "Wallpaper deleted" });
      // Natural break (never launch/generation): throttled interstitial for free users
      if (!premium) nativeAds.maybeShowInterstitial();
    } catch (e) {
      onRestore?.(wallpaper);
      toast({ title: "Could not delete", variant: "destructive" });
    }
  };

  const handleFav = async () => {
    // Optimistic: flip the heart immediately, revert if the request fails
    const optimistic = { ...wallpaper, is_favorite: !wallpaper.is_favorite };
    onToggleFav?.(optimistic);
    try {
      const updated = await base44.entities.Wallpaper.update(wallpaper.id, {
        is_favorite: optimistic.is_favorite
      });
      onToggleFav?.(updated);
    } catch (e) {
      onToggleFav?.(wallpaper);
      toast({ title: "Could not update", variant: "destructive" });
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400/40 hover:shadow-[0_0_30px_rgba(138,43,226,0.35)]">
      <div className="relative aspect-[9/16] overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-indigo-900/60 to-fuchsia-900/40" />
        )}
        <Image
          src={wallpaper.image_url}
          alt={wallpaper.title || "AI wallpaper"}
          fittingType="fill"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onLoad={() => setImgLoaded(true)}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/20 to-transparent opacity-80" />

        {/* style badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-md border border-cyan-400/30">
          <Sparkles className="h-3 w-3" />
          {wallpaper.style || "cinematic"}
        </div>

        {/* favorite */}
        <button
          onClick={handleFav}
          className={`absolute top-3 right-3 grid h-8 w-8 select-none place-items-center rounded-full backdrop-blur-md border transition-all ${
            wallpaper.is_favorite
              ? "bg-fuchsia-500/80 border-fuchsia-300 text-white"
              : "bg-black/50 border-white/20 text-white/70 hover:text-white"
          }`}
        >
          <Heart className={`h-4 w-4 ${wallpaper.is_favorite ? "fill-current" : ""}`} />
        </button>

        {/* actions */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 p-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <p className="line-clamp-2 text-xs text-white/80 pr-2">
            {wallpaper.prompt}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={handleDownload}
              className="grid h-8 w-8 select-none place-items-center rounded-lg bg-cyan-500/80 text-white hover:bg-cyan-400 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="grid h-8 w-8 select-none place-items-center rounded-lg bg-rose-500/80 text-white hover:bg-rose-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AdGateModal
        open={adOpen}
        title="Watch to download"
        description="A short video ad keeps Masterpiece free. Premium downloads instantly."
        onComplete={() => {
          setAdOpen(false);
          doDownload();
        }}
        onClose={() => setAdOpen(false)}
        onUpgrade={() => {
          setAdOpen(false);
          onUpgrade?.();
        }}
      />
    </div>
  );
}