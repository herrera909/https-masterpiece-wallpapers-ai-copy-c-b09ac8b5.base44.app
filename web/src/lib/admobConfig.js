// Google AdMob configuration for the native Android build.
// AdMob IDs are public identifiers — NOT secrets — and are safe to ship in app code.
//
// Production IDs belong to the Android app (package com.masterpiece.wallpapers.ai1).
// Debug/testing builds use Google's OFFICIAL test ad unit IDs so test traffic
// never bills the production ad units.

export const ANDROID_PACKAGE_NAME = "com.masterpiece.wallpapers.ai1";

export const ADMOB_APP_ID = "ca-app-pub-6387191957285572~4480199819";

export const PRODUCTION_AD_UNITS = {
  banner: "ca-app-pub-6387191957285572/5080519948",
  interstitial: "ca-app-pub-6387191957285572/3767438275",
  rewarded: "ca-app-pub-6387191957285572/2454356609"
};

// Google's official Android TEST ad unit IDs (documented, safe for all devices)
export const TEST_AD_UNITS = {
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
  rewarded: "ca-app-pub-3940256099942544/5224354917"
};

// Test IDs in debug/dev builds; production IDs only in release builds.
export function getAdUnitIds() {
  const debug = import.meta.env.MODE !== "production";
  return { debug, ...(debug ? TEST_AD_UNITS : PRODUCTION_AD_UNITS) };
}