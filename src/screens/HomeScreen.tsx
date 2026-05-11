import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BTN } from "../theme/buttonTokens";
import type { Lang } from "../types";

const imgS1 = require("../assets/home/s1.png");
const imgS2 = require("../assets/home/s2.png");
const imgS3 = require("../assets/home/s3.png");
const imgS3_1 = require("../assets/home/s3_1.png");

interface HomeScreenProps {
  lang: Lang;
  onStartExam: () => void;
  onStartPractice: () => void;
  onShowHistory: () => void;
}

export function HomeScreen({
  lang,
  onStartExam,
  onStartPractice,
  onShowHistory,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const L = {
    history: lang === "vi" ? "Lịch sử thi" : "試験履歴",
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerImages, { paddingTop: insets.top }]}>
        <Image source={imgS1} style={styles.headerLogo} />
        <Image source={imgS2} style={styles.headerHero} />
      </View>

      <View style={styles.actionBtnContainer}>
        <TouchableOpacity onPress={onStartExam} style={styles.actionBtn} activeOpacity={0.8}>
          <Image source={imgS3} style={styles.actionImage} />
          <View style={styles.actionOverlay}>
            <Text style={styles.actionText}>
              {lang === "vi" ? "Vào phòng thi" : "模擬試験スタート"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onStartPractice} style={styles.actionBtn} activeOpacity={0.8}>
          <Image source={imgS3_1} style={styles.actionImage} />
          <View style={styles.actionOverlay}>
            <Text style={styles.actionText}>
              {lang === "vi" ? "Luyện tập" : "練習"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity onPress={onShowHistory} activeOpacity={0.7}>
          <Text style={styles.historyLink}>{L.history}</Text>
        </TouchableOpacity>
        <Text style={styles.credit}>CREATED BY DUYHUNG</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between"  },
  headerImages: { alignItems: "center", width: "100%", overflow: "visible", paddingHorizontal: 12, backgroundColor: "transparent" },
  headerLogo: { position: "absolute",marginTop: 10, overflow: "visible", width: 190, height: 140 },
  headerHero: { position: "absolute",marginTop: 160, height: 90, width:330},
  actionBtnContainer: { alignItems: "center", paddingHorizontal: BTN.containerPaddingH, gap: BTN.gapBetweenBtns },
  actionBtn: {
    alignSelf: "center",
    width: BTN.width,
    borderRadius: BTN.borderRadius,
    overflow: "visible",
    position: "relative",
    zIndex: 1,
    elevation: BTN.elevation,
  },
  actionImage: { width: BTN.width, height: BTN.height },
  actionOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  actionText: {
    color: BTN.textColor,
    fontWeight: BTN.fontWeight,
    fontSize: BTN.fontSize,
    textShadowColor: BTN.textShadowColor,
    textShadowOffset: BTN.textShadowOffset,
    textShadowRadius: BTN.textShadowRadius,
  },
  bottomRow: { paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4, zIndex: 1, elevation: 5 },
  historyLink: { fontSize: 12, color: "#92400e", textDecorationLine: "underline" },
  credit: { fontSize: 9, color: "rgba(0,0,0,0.5)", fontWeight: "600", letterSpacing: 1 },
});
