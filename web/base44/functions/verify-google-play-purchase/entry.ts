import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { importPKCS8, SignJWT } from "npm:jose@5.10.0";

const PACKAGE_NAME = "com.masterpiece.wallpapers.ai1";
const PRODUCT_ID = "masterpiece_premium_monthly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";

async function googleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(serviceAccount.private_key, "RS256");
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  if (!response.ok) throw new Error("Google authorization failed");
  const payload = await response.json();
  return payload.access_token;
}

async function tokenFingerprint(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export default async function(req: Request) {
  try {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Login required" }, { status: 401 });

    const { productId, purchaseToken } = await req.json().catch(() => ({}));
    if (productId !== PRODUCT_ID || typeof purchaseToken !== "string" || !purchaseToken) {
      return Response.json({ error: "Invalid Google Play purchase" }, { status: 400 });
    }

    const rawCredentials = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON");
    if (!rawCredentials) {
      console.error("verify-google-play-purchase: service account secret not configured");
      return Response.json({ error: "Google Play verification is not configured" }, { status: 503 });
    }

    const accessToken = await googleAccessToken(JSON.parse(rawCredentials));
    const verifyUrl =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
    const verifyResponse = await fetch(verifyUrl, {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    if (!verifyResponse.ok) {
      console.error("verify-google-play-purchase: verification rejected", verifyResponse.status);
      return Response.json({ error: "Google Play purchase could not be verified" }, { status: 400 });
    }

    const purchase = await verifyResponse.json();
    const productMatches = (purchase.lineItems || []).some(
      (lineItem: any) => lineItem.productId === PRODUCT_ID
    );
    const activeStates = new Set([
      "SUBSCRIPTION_STATE_ACTIVE",
      "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"
    ]);
    if (!productMatches || !activeStates.has(purchase.subscriptionState)) {
      return Response.json({ premium: false, state: purchase.subscriptionState || "unknown" });
    }

    const fingerprint = await tokenFingerprint(purchaseToken);
    const checkoutSessionId = `googleplay:${fingerprint}`;
    const db = base44.asServiceRole;
    const existing = await db.entities.Base44Purchase.filter({ checkoutSessionId });

    if (!existing.length) {
      await db.entities.Base44Purchase.create({
        checkoutSessionId,
        status: "paid",
        orderId: purchase.latestOrderId || purchase.lineItems?.[0]?.latestSuccessfulOrderId || "",
        appUserId: user.id,
        buyerEmail: user.email || "",
        productId: "premium",
        productName: "Masterpiece Premium — Google Play",
        quantity: 1,
        amount: "9.99",
        currency: "USD",
        subscriptionId: PRODUCT_ID,
        paidAt: new Date().toISOString()
      });
    }

    await db.entities.User.update(user.id, { plan: "premium" });
    return Response.json({ premium: true, provider: "google_play" });
  } catch (error) {
    console.error("verify-google-play-purchase: error", error);
    return Response.json({ error: "Purchase verification failed" }, { status: 500 });
  }
}