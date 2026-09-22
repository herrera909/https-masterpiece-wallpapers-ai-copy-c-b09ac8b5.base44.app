package com.masterpiece.wallpapers.ai;

import android.app.Activity;
import android.app.WallpaperManager;
import android.content.ContentValues;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.json.JSONObject;

public final class WallpaperBridge {
    private final Activity activity;
    private final WebView webView;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    WallpaperBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
    }

    @JavascriptInterface
    public void save(String imageUrl, String title) {
        executor.execute(() -> {
            try {
                saveBitmap(download(imageUrl), title);
                callback("onSaved", true, "Saved to Pictures");
            } catch (Exception error) {
                callback("onSaved", false, "Could not save wallpaper");
            }
        });
    }

    @JavascriptInterface
    public void saveDataUrl(String dataUrl, String title) {
        executor.execute(() -> {
            try {
                int comma = dataUrl == null ? -1 : dataUrl.indexOf(',');
                if (comma < 0) throw new IllegalArgumentException("Invalid image data");
                byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
                Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                if (bitmap == null) throw new IllegalStateException("Invalid image");
                saveBitmap(bitmap, title);
                callback("onSaved", true, "Saved to Pictures");
            } catch (Exception error) {
                callback("onSaved", false, "Could not save wallpaper");
            }
        });
    }

    @JavascriptInterface
    public void setWallpaper(String imageUrl) {
        executor.execute(() -> {
            try {
                WallpaperManager.getInstance(activity).setBitmap(download(imageUrl));
                callback("onWallpaperSet", true, "Wallpaper applied");
            } catch (Exception error) {
                callback("onWallpaperSet", false, "Could not apply wallpaper");
            }
        });
    }

    private void saveBitmap(Bitmap bitmap, String title) throws Exception {
        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.DISPLAY_NAME, sanitize(title) + ".png");
        values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Masterpiece Wallpapers AI");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);
        }

        Uri uri = activity.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) throw new IllegalStateException("Unable to create image");
        try (OutputStream output = activity.getContentResolver().openOutputStream(uri)) {
            if (output == null || !bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)) {
                throw new IllegalStateException("Unable to save image");
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.clear();
            values.put(MediaStore.Images.Media.IS_PENDING, 0);
            activity.getContentResolver().update(uri, values, null, null);
        }
    }

    private Bitmap download(String imageUrl) throws Exception {
        URL url = new URL(imageUrl);
        if (!"https".equalsIgnoreCase(url.getProtocol())) throw new SecurityException("HTTPS required");

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(30000);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("User-Agent", "MasterpieceWallpapersAI/2.2");
        connection.setRequestProperty("Accept", "image/*");
        try (InputStream input = connection.getInputStream()) {
            Bitmap bitmap = BitmapFactory.decodeStream(input);
            if (bitmap == null) throw new IllegalStateException("Invalid image");
            return bitmap;
        } finally {
            connection.disconnect();
        }
    }

    private String sanitize(String value) {
        String safe = value == null ? "masterpiece-wallpaper" : value.replaceAll("[^a-zA-Z0-9 _-]", "").trim();
        return safe.isEmpty() ? "masterpiece-wallpaper" : safe.substring(0, Math.min(60, safe.length()));
    }

    private void callback(String method, boolean success, String message) {
        String script = "window.__masterpieceWallpaper&&window.__masterpieceWallpaper." + method
                + "(" + success + "," + JSONObject.quote(message) + ")";
        activity.runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }
}
