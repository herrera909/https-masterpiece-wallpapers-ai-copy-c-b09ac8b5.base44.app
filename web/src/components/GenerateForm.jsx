import React, { useState } from "react";
import { Wand2, Loader2, Shuffle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import AdGateModal from "@/components/AdGateModal";

const STYLES = [
  { id: "cinematic", label: "Cinematic", emoji: "🎬" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃" },
  { id: "fantasy", label: "Fantasy", emoji: "🐉" },
  { id: "minimal", label: "Minimal", emoji: "◻️" },
  { id: "abstract", label: "Abstract", emoji: "🌀" },
  { id: "anime", label: "Anime", emoji: "🌸" }
];

const SAMPLE_PROMPTS = [
  "A lone astronaut gazing at a glowing purple nebula portal on a crystal cliff",
  "Bioluminescent forest with floating islands and twin moons",
  "A samurai standing in neon-lit rain under a giant holographic dragon",
  "Misty mountain temple at dawn with golden light rays",
  "A whale swimming through a galaxy of stars and aurora",
  "Cyberpunk marketplace with glowing neon signs and rain reflections"
];

export default function GenerateForm({ onCreated, premium, onUpgrade }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [loading, setLoading] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const { toast } = useToast();

  const generate = () => {
    if (!prompt.trim()) {
      toast({ title: "Describe your wallpaper first", variant: "destructive" });
      return;
    }
    if (!premium) {
      setAdOpen(true); // free users watch an ad before generating
      return;
    }
    runGenerate();
  };

  const runGenerate = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke("generateWallpaper", {
        prompt: prompt.trim(),
        style
      });
      const image_url = response.data.image_url;
      const record = await base44.entities.Wallpaper.create({
        prompt: prompt.trim(),
        image_url,
        style,
        title: prompt.trim().slice(0, 60)
      });
      onCreated?.(record);
      toast({ title: "Masterpiece created ✨" });
      setPrompt("");
    } catch (e) {
      console.error(e);
      toast({ title: "Generation failed. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const surprise = () => {
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #8A2BE2, transparent 70%)" }}
      />
      <div className="relative">
        <div className="mb-5 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-fuchsia-400" />
          <h2 className="text-lg font-bold tracking-wide text-white">Create Your Wallpaper</h2>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Imagine it... a lone astronaut before a glowing purple portal..."
            rows={3}
            maxLength={300}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/20"
          />
          <button
            onClick={surprise}
            type="button"
            className="absolute bottom-3 right-3 flex select-none items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-cyan-300 hover:bg-white/20 transition-colors"
          >
            <Shuffle className="h-3.5 w-3.5" /> Surprise me
          </button>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Style</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`flex select-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                  style === s.id
                    ? "border-fuchsia-400/60 bg-fuchsia-500/20 text-white shadow-[0_0_16px_rgba(138,43,226,0.4)]"
                    : "border-white/10 bg-black/30 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="group relative mt-6 flex w-full select-none items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-sm font-bold tracking-wide text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, #00E5FF 0%, #8A2BE2 50%, #FF00FF 100%)",
            boxShadow: "0 0 28px rgba(138,43,226,0.5)"
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Imagining your masterpiece...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              Generate Wallpaper
            </>
          )}
        </button>
      </div>

      <AdGateModal
        open={adOpen}
        title="Watch to create"
        description="A short ad keeps Masterpiece free. Premium removes all ads."
        onComplete={() => {
          setAdOpen(false);
          runGenerate();
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