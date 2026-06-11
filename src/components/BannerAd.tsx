import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getBannerId } from "../lib/adService";
import { logger } from "../utils/logger";

let BannerNative: any = null;
try {
  BannerNative = require("react-native-google-mobile-ads").Banner;
} catch {
  BannerNative = null;
}

export function BannerAd() {
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!BannerNative) {
      setLoadError("Module not found");
      return;
    }
    setBannerLoaded(true);
  }, []);

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ad Error: {loadError}</Text>
      </View>
    );
  }

  if (!bannerLoaded || !BannerNative) {
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
        size="ADAPTIVE_BANNER"
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
    minHeight: 50,
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
