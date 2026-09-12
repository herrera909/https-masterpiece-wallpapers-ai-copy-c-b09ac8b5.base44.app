import { useEffect, useState } from "react";
import nativeAds from "@/lib/nativeAds";

// Initializes Google Mobile Ads in the native Android runtime and manages the
// anchored adaptive banner for FREE users (premium users never see ads).
// On the website everything no-ops and the returned height is always 0.
export default function useNativeAds(premium) {
  const [bannerHeight, setBannerHeight] = useState(0);

  // Initialize only in the native runtime
  useEffect(() => {
    nativeAds.init();
  }, []);

  // Free users see the anchored banner; premium users never do
  useEffect(() => {
    if (!nativeAds.isNativeAndroid()) return;
    if (premium) nativeAds.hideBanner();
    else nativeAds.showBanner();
  }, [premium]);

  // Track the banner height so content is padded instead of covered
  useEffect(() => {
    nativeAds.onBannerHeight(setBannerHeight);
    return () => nativeAds.onBannerHeight(null);
  }, []);

  return bannerHeight;
}