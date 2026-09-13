export async function verifyAndAcknowledgeGooglePlayPurchase({
  productId,
  purchaseToken,
  expectedProductId,
  verify,
  acknowledge,
  notify
}) {
  if (productId !== expectedProductId || !purchaseToken) {
    throw new Error("Invalid Google Play purchase");
  }

  const result = await verify({ productId, purchaseToken });
  if (!result?.premium) {
    throw new Error("Google Play purchase could not be verified");
  }

  acknowledge(purchaseToken);
  notify?.();
  return { provider: "google_play", premium: true };
}
