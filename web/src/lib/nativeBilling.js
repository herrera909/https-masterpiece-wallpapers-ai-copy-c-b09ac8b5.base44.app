import { base44 } from "@/api/base44Client";

export const GOOGLE_PLAY_SUBSCRIPTION_ID = "masterpiece_premium_monthly";
const BRIDGE_NAME = "MasterpieceNativeBilling";

const bridge = () =>
  typeof window !== "undefined" ? window[BRIDGE_NAME] : undefined;

export const isNativeGooglePlay = () => !!bridge();

let pendingPurchase = null;

if (typeof window !== "undefined") {
  window.__masterpieceBilling = {
    async onPurchaseCompleted(productId, purchaseToken) {
      if (!pendingPurchase || productId !== GOOGLE_PLAY_SUBSCRIPTION_ID) return;
      try {
        const response = await base44.functions.invoke("verify-google-play-purchase", {
          productId,
          purchaseToken
        });
        if (!response.data?.premium) {
          throw new Error("Google Play purchase could not be verified");
        }
        pendingPurchase.resolve({ provider: "google_play", premium: true });
      } catch (error) {
        pendingPurchase.reject(error);
      } finally {
        pendingPurchase = null;
      }
    },
    onPurchaseCancelled() {
      pendingPurchase?.reject(new Error("Purchase cancelled"));
      pendingPurchase = null;
    },
    onPurchaseFailed(message) {
      pendingPurchase?.reject(new Error(message || "Google Play purchase failed"));
      pendingPurchase = null;
    }
  };
}

export function startGooglePlaySubscription() {
  if (!isNativeGooglePlay()) {
    throw new Error("Google Play Billing is unavailable");
  }
  if (pendingPurchase) {
    return pendingPurchase.promise;
  }

  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  pendingPurchase = { promise, resolve, reject };

  bridge().launchSubscription(GOOGLE_PLAY_SUBSCRIPTION_ID);
  return promise;
}