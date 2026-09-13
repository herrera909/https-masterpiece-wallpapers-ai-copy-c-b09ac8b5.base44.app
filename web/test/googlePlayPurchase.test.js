import assert from "node:assert/strict";
import test from "node:test";
import { verifyAndAcknowledgeGooglePlayPurchase } from "../src/lib/googlePlayPurchase.js";

const productId = "masterpiece_premium_monthly";

test("acknowledges only after successful server verification", async () => {
  const calls = [];
  const result = await verifyAndAcknowledgeGooglePlayPurchase({
    productId,
    purchaseToken: "test-token",
    expectedProductId: productId,
    verify: async () => {
      calls.push("verify");
      return { premium: true };
    },
    acknowledge: () => calls.push("acknowledge"),
    notify: () => calls.push("notify")
  });

  assert.deepEqual(result, { provider: "google_play", premium: true });
  assert.deepEqual(calls, ["verify", "acknowledge", "notify"]);
});

test("does not acknowledge a rejected purchase", async () => {
  let acknowledged = false;
  await assert.rejects(
    verifyAndAcknowledgeGooglePlayPurchase({
      productId,
      purchaseToken: "rejected-token",
      expectedProductId: productId,
      verify: async () => ({ premium: false }),
      acknowledge: () => { acknowledged = true; }
    }),
    /could not be verified/
  );
  assert.equal(acknowledged, false);
});

test("rejects an unexpected product without calling the server", async () => {
  let verified = false;
  await assert.rejects(
    verifyAndAcknowledgeGooglePlayPurchase({
      productId: "wrong-product",
      purchaseToken: "test-token",
      expectedProductId: productId,
      verify: async () => {
        verified = true;
        return { premium: true };
      },
      acknowledge: () => {}
    }),
    /Invalid Google Play purchase/
  );
  assert.equal(verified, false);
});
