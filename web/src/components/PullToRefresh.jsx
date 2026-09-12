import React, { useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

const THRESHOLD = 70;

// Native-style pull-to-refresh: drag down at the top of the list to reload.
export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const handleTouchStart = (e) => {
    if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPull(Math.min(delta * 0.4, 90));
  };

  const handleTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const ready = pull >= THRESHOLD;

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center justify-center overflow-hidden" style={{ height: pull }}>
        {refreshing ? (
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
        ) : (
          <ChevronDown className={`h-5 w-5 transition-transform ${ready ? "rotate-180 text-fuchsia-300" : "text-white/40"}`} />
        )}
      </div>
      {children}
    </div>
  );
}