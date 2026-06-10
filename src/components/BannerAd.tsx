import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { getBannerId } from "../lib/adService";
import { logger } from "../utils/logger";

export function BannerAd() {
  const [BannerComponent, setBannerComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBanner() {
      try {
        const { Banner } = await import("react-native-google-mobile-ads");
        const unitId = getBannerId();
        if (!cancelled) {
          setBannerComponent(() => (props: any) => (
            <Banner
              unitId={unitId}
              size="SMART_BANNER"
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              {...props}
            />
          ));
        }
      } catch {
        // Native module not available — skip rendering
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBanner();
    return () => { cancelled = true; };
  }, []);

  if (loading || !BannerComponent) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="small" color="#ccc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerComponent
        onAdLoaded={() => logger.log("[BannerAd] Loaded")}
        onAdFailedToLoad={(error: any) => logger.warn("[BannerAd] Failed:", error)}
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
});
