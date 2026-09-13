import { base44 } from "@/api/base44Client";
import { verifyAndAcknowledgeGooglePlayPurchase } from "@/lib/googlePlayPurchase";

export const GOOGLE_PLAY_SUBSCRIPTION_ID = "masterpiece_premium_monthly";
const BRIDGE_NAME = "MasterpieceNativeBilling";

const bridge = () =>
  typeof window !== "undefined" ? window[BRIDGE_NAME] : undefined;

export const isNativeGooglePlay = () => !!bridge();

let pendingPurchase = null;

if (typeof window !== "undefined") {
  window.__masterpieceBilling = {
    async onPurchaseCompleted(productId, purchaseToken) {
      if (productId !== GOOGLE_PLAY_SUBSCRIPTION_ID || !purchaseToken) return;
      try {
        const result = await verifyAndAcknowledgeGooglePlayPurchase({
          productId,
          purchaseToken,
          expectedProductId: GOOGLE_PLAY_SUBSCRIPTION_ID,
          verify: async (purchase) => {
            const response = await base44.functions.invoke("verify-google-play-purchase", purchase);
            return response.data;
          },
          acknowledge: (token) => bridge()?.acknowledgePurchase(token),
          notify: () => window.dispatchEvent(new CustomEvent("masterpiece-premium-updated"))
        });
        pendingPurchase?.resolve(result);
      } catch (error) {
        pendingPurchase?.reject(error);
      } finally {
        pendingPurchase = null;
      }
    },
    onPurchasePending() {
      pendingPurchase?.reject(new Error("Purchase is pending approval"));
      pendingPurchase = null;
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

  // Restoration must start only after the callback object above exists.
  bridge()?.restorePurchases();
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
