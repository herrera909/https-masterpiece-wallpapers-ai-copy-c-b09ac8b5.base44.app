const bridge = () =>
  typeof window !== "undefined" ? window.MasterpieceNativeWallpaper : undefined;

export const isNativeWallpaper = () => !!bridge();

let saveCallback;
let setCallback;

if (typeof window !== "undefined") {
  window.__masterpieceWallpaper = {
    onSaved(success, message) {
      saveCallback?.({ success: !!success, message });
      saveCallback = undefined;
    },
    onWallpaperSet(success, message) {
      setCallback?.({ success: !!success, message });
      setCallback = undefined;
    }
  };
}

export function saveWallpaper(url, title, callback) {
  if (!bridge()) return false;
  saveCallback = callback;
  bridge().save(url, title || "masterpiece-wallpaper");
  return true;
}

export function applyWallpaper(url, callback) {
  if (!bridge()) return false;
  setCallback = callback;
  bridge().setWallpaper(url);
  return true;
}
