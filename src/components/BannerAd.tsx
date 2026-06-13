import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getBannerId } from "../lib/adService";
import { logger } from "../utils/logger";

export function BannerAd() {
  const [BannerNative, setBannerNative] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    import("react-native-google-mobile-ads")
      .then((mod) => {
        const Banner = mod.BannerAd;
        if (Banner) {
          setBannerNative(() => Banner);
        } else {
          setLoadError("BannerAd not found in module");
        }
      })
      .catch((err) => {
        logger.warn("[BannerAd] Module load failed:", err);
        setLoadError("Module not found");
      });
  }, []);

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ad Error: {loadError}</Text>
      </View>
    );
  }

  if (!BannerNative) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="small" color="#ccc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerNative
        unitId={getBannerId()}
        size="ANCHORED_ADAPTIVE_BANNER"
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => logger.log("[BannerAd] Loaded")}
        onAdFailedToLoad={(e: any) => {
          const msg = e?.message ?? String(e);
          logger.warn("[BannerAd] Failed:", msg);
          setLoadError(msg);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    width: "100%",
    marginTop: 8,
  },
  placeholder: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
  },
  errorText: {
    fontSize: 10,
    color: "#dc2626",
  },
});
