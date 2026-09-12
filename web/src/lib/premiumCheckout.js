import { base44 } from "@/api/base44Client";
import {
  isNativeGooglePlay,
  startGooglePlaySubscription
} from "@/lib/nativeBilling";

// Android uses Google Play Billing. The website keeps the existing Base44/Wix checkout.
export async function startPremiumCheckout() {
  if (isNativeGooglePlay()) {
    return startGooglePlaySubscription();
  }

  const res = await base44.functions.invoke("create-checkout", { productId: "premium" });
  const url = res.data?.redirectUrl;
  if (!url) throw new Error("Checkout unavailable");
  window.location.href = url;
}