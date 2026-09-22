package com.masterpiece.wallpapers.ai;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import com.google.android.gms.ads.MobileAds;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {
    private static final String APP_URL = "https://masterpiecewallpapersai.base44.app";
    private static final String APP_HOST = "masterpiecewallpapersai.base44.app";
    private WebView webView;
    private MasterpieceBillingBridge billingBridge;
    private AdMobBridge adMobBridge;
    private WallpaperBridge wallpaperBridge;

    @SuppressLint("SetJavaScriptEnabled")
    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        webView.setBackgroundColor(Color.rgb(5, 8, 22));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " MasterpieceWallpapersAI/2.1");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        billingBridge = new MasterpieceBillingBridge(this, webView);
        adMobBridge = new AdMobBridge(this, root, webView);
        wallpaperBridge = new WallpaperBridge(this, webView);
        webView.addJavascriptInterface(billingBridge, "MasterpieceNativeBilling");
        webView.addJavascriptInterface(adMobBridge, "MasterpieceNativeAds");
        webView.addJavascriptInterface(wallpaperBridge, "MasterpieceNativeWallpaper");
        webView.addJavascriptInterface(wallpaperBridge, "Android");
        MobileAds.initialize(this);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                String host = uri.getHost();
                if ("https".equalsIgnoreCase(scheme)
                        && "media.base44.com".equalsIgnoreCase(host)
                        && uri.getPath() != null
                        && uri.getPath().startsWith("/images/")) {
                    wallpaperBridge.save(uri.toString(), "masterpiece-wallpaper");
                    return true;
                }
                if ("https".equalsIgnoreCase(scheme) && APP_HOST.equalsIgnoreCase(host)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) {}
                return true;
            }
        });
        webView.setDownloadListener((url, agent, disposition, type, length) -> {
            if (wallpaperBridge == null || url == null) return;
            if (url.startsWith("blob:")) {
                String script = "(async()=>{try{const r=await fetch(" + JSONObject.quote(url)
                        + ");const b=await r.blob();const f=new FileReader();"
                        + "f.onload=()=>window.MasterpieceNativeWallpaper.saveDataUrl(f.result,'masterpiece-wallpaper');"
                        + "f.readAsDataURL(b);}catch(e){window.__masterpieceWallpaper&&"
                        + "window.__masterpieceWallpaper.onSaved(false,'Could not save wallpaper');}})()";
                webView.evaluateJavascript(script, null);
            } else {
                wallpaperBridge.save(url, "masterpiece-wallpaper");
            }
        });
        if (state == null) webView.loadUrl(APP_URL); else webView.restoreState(state);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack(); else finish();
            }
        });
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        webView.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override protected void onDestroy() {
        if (billingBridge != null) billingBridge.close();
        if (adMobBridge != null) adMobBridge.destroy();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
