package com.masterpiece.wallpapers.ai;

import android.app.Activity;
import android.graphics.Color;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import org.json.JSONObject;

public final class AdMobBridge {
    private static final String TEST_BANNER = "ca-app-pub-3940256099942544/6300978111";
    private static final String TEST_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
    private static final String TEST_REWARDED = "ca-app-pub-3940256099942544/5224354917";
    private final Activity activity;
    private final FrameLayout root;
    private final WebView webView;
    private AdView banner;
    private InterstitialAd interstitial;
    private RewardedAd rewarded;
    private String bannerId;
    private String interstitialId;
    private String rewardedId;

    public AdMobBridge(Activity activity, FrameLayout root, WebView webView) {
        this.activity = activity;
        this.root = root;
        this.webView = webView;
    }

    @JavascriptInterface public void init(String appId, String requestedBannerId,
        String requestedInterstitialId, String requestedRewardedId, boolean debug) {
        bannerId = BuildConfig.DEBUG ? TEST_BANNER : requestedBannerId;
        interstitialId = BuildConfig.DEBUG ? TEST_INTERSTITIAL : requestedInterstitialId;
        rewardedId = BuildConfig.DEBUG ? TEST_REWARDED : requestedRewardedId;
        activity.runOnUiThread(() -> {
            loadBanner();
            loadInterstitial();
            loadRewarded();
        });
    }

    private void loadBanner() {
        if (banner != null || bannerId == null) return;
        banner = new AdView(activity);
        banner.setAdUnitId(bannerId);
        int widthPx = activity.getResources().getDisplayMetrics().widthPixels;
        float density = activity.getResources().getDisplayMetrics().density;
        banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(
            activity, Math.max(1, (int)(widthPx / density))));
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.gravity = Gravity.TOP;
        banner.setVisibility(AdView.GONE);
        banner.setBackgroundColor(Color.TRANSPARENT);
        root.addView(banner, lp);
        banner.setAdListener(new AdListener() {
            @Override public void onAdLoaded() {
                js("window.__masterpieceAds&&window.__masterpieceAds.onBannerHeight(" +
                    banner.getAdSize().getHeightInPixels(activity) + ")");
            }
        });
        banner.loadAd(new AdRequest.Builder().build());
    }

    @JavascriptInterface public void showBanner() {
        activity.runOnUiThread(() -> {
            loadBanner();
            if (banner != null) banner.setVisibility(AdView.VISIBLE);
        });
    }

    @JavascriptInterface public void hideBanner() {
        activity.runOnUiThread(() -> {
            if (banner != null) banner.setVisibility(AdView.GONE);
            js("window.__masterpieceAds&&window.__masterpieceAds.onBannerHeight(0)");
        });
    }

    private void loadInterstitial() {
        if (interstitialId == null) return;
        InterstitialAd.load(activity, interstitialId, new AdRequest.Builder().build(),
            new InterstitialAdLoadCallback() {
                @Override public void onAdLoaded(InterstitialAd ad) { interstitial = ad; }
            });
    }

    @JavascriptInterface public void showInterstitial() {
        activity.runOnUiThread(() -> {
            if (interstitial == null) { loadInterstitial(); return; }
            interstitial.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() {
                    interstitial = null;
                    loadInterstitial();
                }
                @Override public void onAdFailedToShowFullScreenContent(AdError error) {
                    interstitial = null;
                    loadInterstitial();
                }
            });
            interstitial.show(activity);
        });
    }

    private void loadRewarded() {
        if (rewardedId == null) return;
        RewardedAd.load(activity, rewardedId, new AdRequest.Builder().build(),
            new RewardedAdLoadCallback() {
                @Override public void onAdLoaded(RewardedAd ad) { rewarded = ad; }
            });
    }

    @JavascriptInterface public void showRewarded(String requestId) {
        activity.runOnUiThread(() -> {
            if (rewarded == null) {
                loadRewarded();
                js("window.__masterpieceAds&&window.__masterpieceAds.onRewardedFailed(" +
                    JSONObject.quote(requestId) + ")");
                return;
            }
            final boolean[] earned = { false };
            rewarded.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() {
                    if (!earned[0]) js("window.__masterpieceAds&&window.__masterpieceAds.onRewardedDismissed(" +
                        JSONObject.quote(requestId) + ")");
                    rewarded = null;
                    loadRewarded();
                }
                @Override public void onAdFailedToShowFullScreenContent(AdError error) {
                    js("window.__masterpieceAds&&window.__masterpieceAds.onRewardedFailed(" +
                        JSONObject.quote(requestId) + ")");
                    rewarded = null;
                    loadRewarded();
                }
            });
            rewarded.show(activity, reward -> {
                earned[0] = true;
                js("window.__masterpieceAds&&window.__masterpieceAds.onRewarded(" +
                    JSONObject.quote(requestId) + ",true)");
            });
        });
    }

    private void js(String script) {
        activity.runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }

    public void destroy() {
        if (banner != null) {
            root.removeView(banner);
            banner.destroy();
            banner = null;
        }
        interstitial = null;
        rewarded = null;
    }
}
