package com.masterpiece.wallpapers.ai;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.android.billingclient.api.*;
import java.util.Collections;
import java.util.List;
import org.json.JSONObject;

public final class MasterpieceBillingBridge implements PurchasesUpdatedListener {
    private static final String PRODUCT_ID = "masterpiece_premium_monthly";
    private final Activity activity;
    private final WebView webView;
    private final BillingClient client;

    public MasterpieceBillingBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        client = BillingClient.newBuilder(activity).setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()).build();
        // The page installs its JavaScript callback after this object is created.
        // Let the page request restoration once that callback is ready.
        connect(() -> {});
    }

    private void connect(Runnable ready) {
        if (client.isReady()) { ready.run(); return; }
        client.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult r) {
                if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) ready.run();
                else fail(r.getDebugMessage());
            }
            @Override public void onBillingServiceDisconnected() {
                // The next purchase or restore request reconnects.
            }
        });
    }

    @JavascriptInterface public void restorePurchases() {
        activity.runOnUiThread(() -> connect(this::restore));
    }

    @JavascriptInterface public void acknowledgePurchase(String purchaseToken) {
        if (purchaseToken == null || purchaseToken.isEmpty()) return;
        activity.runOnUiThread(() -> connect(() -> client.acknowledgePurchase(
            AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchaseToken).build(),
            result -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    fail(result.getDebugMessage());
                }
            })));
    }

    @JavascriptInterface public void launchSubscription(String productId) {
        activity.runOnUiThread(() -> {
            if (!PRODUCT_ID.equals(productId)) { fail("Unknown subscription"); return; }
            connect(this::queryAndLaunch);
        });
    }

    private void queryAndLaunch() {
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(PRODUCT_ID).setProductType(BillingClient.ProductType.SUBS).build();
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(product)).build();
        client.queryProductDetailsAsync(params, (result, response) -> {
            List<ProductDetails> products = response.getProductDetailsList();
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || products.isEmpty()) {
                fail("Subscription is not available in Google Play"); return;
            }
            ProductDetails details = products.get(0);
            List<ProductDetails.SubscriptionOfferDetails> offers = details.getSubscriptionOfferDetails();
            if (offers == null || offers.isEmpty()) { fail("No active monthly offer is configured"); return; }
            ProductDetails.SubscriptionOfferDetails selected = offers.stream()
                .filter(offer -> "monthly".equals(offer.getBasePlanId()))
                .findFirst().orElse(offers.get(0));
            BillingFlowParams.ProductDetailsParams item = BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(details).setOfferToken(selected.getOfferToken()).build();
            BillingResult launch = client.launchBillingFlow(activity, BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(item)).build());
            if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) fail(launch.getDebugMessage());
        });
    }

    @Override public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            js("window.__masterpieceBilling&&window.__masterpieceBilling.onPurchaseCancelled()"); return;
        }
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || purchases == null) {
            fail(result.getDebugMessage()); return;
        }
        for (Purchase purchase : purchases) handle(purchase);
    }

    private void restore() {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS).build();
        client.queryPurchasesAsync(params, (result, purchases) -> {
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK)
                for (Purchase purchase : purchases) handle(purchase);
        });
    }

    private void handle(Purchase purchase) {
        if (!purchase.getProducts().contains(PRODUCT_ID)) return;
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            js("window.__masterpieceBilling&&window.__masterpieceBilling.onPurchasePending()");
            return;
        }
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return;
        js("window.__masterpieceBilling&&window.__masterpieceBilling.onPurchaseCompleted(" +
            JSONObject.quote(PRODUCT_ID) + "," + JSONObject.quote(purchase.getPurchaseToken()) + ")");
    }

    private void fail(String message) {
        js("window.__masterpieceBilling&&window.__masterpieceBilling.onPurchaseFailed(" +
            JSONObject.quote(message == null || message.isEmpty() ? "Google Play Billing failed" : message) + ")");
    }
    private void js(String script) { activity.runOnUiThread(() -> webView.evaluateJavascript(script, null)); }
    public void close() { client.endConnection(); }
}
