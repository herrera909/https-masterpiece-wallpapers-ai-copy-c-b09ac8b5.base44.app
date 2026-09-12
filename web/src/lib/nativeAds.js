// JavaScript bridge to the native Android AdMob layer.
//
// The generated Android project is expected to inject an object named
// `MasterpieceNativeAds` into the WebView (via addJavascriptInterface) exposing:
//   init(appId, bannerId, interstitialId, rewardedId, debug)
//   showBanner() / hideBanner()
//   showRewarded(requestId)
//   showInterstitial()
// and to report events back via evaluateJavascript calls to
// window.__masterpieceAds.<event>(...) — see the emitter below.
//
// On the website this object never exists: every call no-ops and the app falls
// back to its existing web flow. NO AdMob SDK code runs in the browser.

import { ADMOB_APP_ID, getAdUnitIds } from "@/lib/admobConfig";

const BRIDGE_NAME = "MasterpieceNativeAds";
const INTERSTITIAL_MIN_INTERVAL_MS = 90 * 1000; // natural-break pacing

const pendingRewarded = new Map();
let bannerHeightCallback = null;
let initialized = false;
let lastInterstitialAt = 0;

const bridge = () => window[BRIDGE_NAME];

export const isNativeAndroid = () =>
  typeof window !== "undefined" && !!window[BRIDGE_NAME];

// ---- Events raised by the native layer ----
// Native calls e.g.:
//   webView.evaluateJavascript(
//     "window.__masterpieceAds.onRewarded('<requestId>', true)", null)
if (typeof window !== "undefined") {
  window.__masterpieceAds = {
    // earnedReward is true ONLY when AdMob fires the earned-reward callback.
    onRewarded(requestId, earnedReward) {
      const req = pendingRewarded.get(requestId);
      if (!req || !earnedReward) return;
      pendingRewarded.delete(requestId);
      req.onRewarded?.(); // the gated action is granted ONLY here
    },
    // Fires when the ad closes without a reward (or after reward — already cleaned)
    onRewardedDismissed(requestId) {
      const req = pendingRewarded.get(requestId);
      if (!req) return;
      pendingRewarded.delete(requestId);
      req.onDismissed?.();
    },
    onRewardedFailed(requestId) {
      const req = pendingRewarded.get(requestId);
      if (!req) return;
      pendingRewarded.delete(requestId);
      req.onDismissed?.();
    },
    // Native reports the anchored banner's pixel height so the page can pad content
    onBannerHeight(height) {
      bannerHeightCallback?.(Number(height) || 0);
    }
  };
}

export function init() {
  if (initialized || !isNativeAndroid()) return;
  const ids = getAdUnitIds();
  bridge().init(ADMOB_APP_ID, ids.banner, ids.interstitial, ids.rewarded, ids.debug);
  initialized = true;
}

export function showBanner() {
  bridge()?.showBanner();
}

export function hideBanner() {
  bridge()?.hideBanner();
}

export function onBannerHeight(callback) {
  bannerHeightCallback = callback;
}

// Shows a rewarded ad; `onRewarded` fires ONLY from AdMob's earned-reward callback.
export function showRewarded({ onRewarded, onDismissed }) {
  if (!isNativeAndroid()) return false;
  const requestId = `rw-${Date.now()}`;
  pendingRewarded.set(requestId, { onRewarded, onDismissed });
  bridge().showRewarded(requestId);
  return true;
}

// Interstitials only at natural breaks, throttled; never on launch/during generation.
export function maybeShowInterstitial() {
  if (!isNativeAndroid()) return false;
  const now = Date.now();
  if (now - lastInterstitialAt < INTERSTITIAL_MIN_INTERVAL_MS) return false;
  lastInterstitialAt = now;
  bridge().showInterstitial();
  return true;
}

const nativeAds = {
  isNativeAndroid,
  init,
  showBanner,
  hideBanner,
  onBannerHeight,
  showRewarded,
  maybeShowInterstitial
};

export default nativeAds;