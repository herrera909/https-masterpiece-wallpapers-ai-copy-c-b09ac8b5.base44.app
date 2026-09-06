package com.masterpiece.wallpapers.ai;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.graphics.Color;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.LoadAdError;

public class MainActivity extends AppCompatActivity {
    private static final String BANNER_AD_UNIT = "ca-app-pub-6387191957285572/9053057571";
    private static final String INTERSTITIAL_AD_UNIT = "ca-app-pub-6387191957285572/7711171269";

    private EditText promptInput;
    private ImageView previewImage;
    private TextView imageUrlText;
    private InterstitialAd interstitialAd;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MobileAds.initialize(this, initializationStatus -> {});

        ScrollView scrollView = new ScrollView(this);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(32, 32, 32, 32);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        scrollView.addView(root);

        promptInput = new EditText(this);
        promptInput.setHint("Wallpaper Idea");
        promptInput.setSingleLine(false);
        root.addView(promptInput, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        Button generateButton = new Button(this);
        generateButton.setText("Generate AI Wallpaper");
        root.addView(generateButton);

        previewImage = new ImageView(this);
        previewImage.setBackgroundColor(Color.rgb(245, 245, 245));
        previewImage.setScaleType(ImageView.ScaleType.CENTER_CROP);
        root.addView(previewImage, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                1200));

        imageUrlText = new TextView(this);
        imageUrlText.setText("Enter a wallpaper idea, then tap generate.");
        imageUrlText.setPadding(0, 24, 0, 24);
        root.addView(imageUrlText);

        AdView banner = new AdView(this);
        banner.setAdSize(AdSize.BANNER);
        banner.setAdUnitId(BANNER_AD_UNIT);
        root.addView(banner);
        banner.loadAd(new AdRequest.Builder().build());

        generateButton.setOnClickListener(v -> generateWallpaper());
        loadInterstitial();

        setContentView(scrollView);
    }

    private void generateWallpaper() {
        String prompt = promptInput.getText().toString().trim();
        if (prompt.isEmpty()) {
            promptInput.setError("Enter a wallpaper idea");
            return;
        }

        hideKeyboard();
        String encoded = prompt.replace(" ", "%20");
        String url = "https://image.pollinations.ai/prompt/" + encoded + "?width=1080&height=1920";
        imageUrlText.setText(url);
        new ImageLoadTask(previewImage).execute(url);

        if (interstitialAd != null) {
            interstitialAd.show(this);
            interstitialAd = null;
        }
        loadInterstitial();
    }

    private void loadInterstitial() {
        InterstitialAd.load(this, INTERSTITIAL_AD_UNIT, new AdRequest.Builder().build(),
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(InterstitialAd ad) {
                        interstitialAd = ad;
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError error) {
                        interstitialAd = null;
                    }
                });
    }

    private void hideKeyboard() {
        InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        View current = getCurrentFocus();
        if (imm != null && current != null) {
            imm.hideSoftInputFromWindow(current.getWindowToken(), 0);
        }
    }
}
