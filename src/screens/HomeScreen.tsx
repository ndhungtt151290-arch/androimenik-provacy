import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BTN } from "../theme/buttonTokens";
import type { Lang } from "../types";

const imgS1 = require("../assets/home/s1.png");
const imgS2 = require("../assets/home/s2.png");
const imgS3 = require("../assets/home/s3.png");
const imgS3_1 = require("../assets/home/s3_1.png");
const imgMenu = require("../assets/home/menu.png");
const iconQuestion = require("../assets/home/icon-question.png");
const iconTip = require("../assets/home/icon-tip.png");
const iconProcedure = require("../assets/home/icon-procedure.png");
const iconLocation = require("../assets/home/icon-location.png");
const iconContact = require("../assets/home/icon-contact.png");
const iconBug = require("../assets/home/icon-bug.png");

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
  const [menuVisible, setMenuVisible] = useState(false);

  const L = {
    history: lang === "vi" ? "Lịch sử thi" : "試験履歴",
  };

 
  const menuItems = [
    { id: 1, label: lang === "vi" ? "Câu hỏi hay sai" : "○×問題", icon: iconQuestion },
    { id: 2, label: lang === "vi" ? "Mẹo ghi nhớ" : "記憶のコツ", icon: iconTip },
    { id: 3, label: lang === "vi" ? "Thủ tục thi" : "試験手続き", icon: iconProcedure },
    { id: 4, label: lang === "vi" ? "Địa điểm thi" : "試験場所", icon: iconLocation },
    { id: 5, label: lang === "vi" ? "Liên hệ" : "お問い合わせ", icon: iconContact },
    { id: 6, label: lang === "vi" ? "Báo lỗi câu hỏi" : "問題の報告", icon: iconBug },
  ];

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

        <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
          <Image source={imgMenu} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity onPress={onShowHistory} activeOpacity={0.7}>
          <Text style={styles.historyLink}>{L.history}</Text>
        </TouchableOpacity>
        <Text style={styles.credit}>CREATED BY DUYHUNG</Text>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{lang === "vi" ? "Menu" : "メニュー"}</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconWrapper}>
                    <Image source={item.icon} style={styles.menuIconBig} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeBtnText}>
                {lang === "vi" ? "Đóng" : "閉じる"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between"  },
  headerImages: { alignItems: "center", width: "100%", overflow: "visible", paddingHorizontal: 12, backgroundColor: "transparent" },
  headerLogo: { position: "absolute",marginTop: 10, overflow: "visible", width: 190, height: 140 },
  headerHero: { position: "absolute",marginTop: 170, height: 90, width:330},
  actionBtnContainer: { alignItems: "center", paddingHorizontal: BTN.containerPaddingH, gap: BTN.gapBetweenBtns, marginTop: 95  },
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
  menuIcon: {
    alignSelf: "center",
    marginTop: 8,
    width: 58,
    height: 58,
  },
  bottomRow: { paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4, zIndex: 1, elevation: 5 },
  historyLink: { fontSize: 12, color: "#92400e", textDecorationLine: "underline" },
  credit: { fontSize: 9, color: "rgba(0,0,0,0.5)", fontWeight: "600", letterSpacing: 5 },
  overlay: { flex: 1, backgroundColor: "rgba(22, 21, 21, 0.0)", justifyContent: "flex-end" },
  overlayTouch: { flex: 1 },
  bottomSheet: {
    backgroundColor: "rgba(255, 245, 245, 0.97)",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "70%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 20,color: "rgba(0, 0, 0, 0.95)", fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuItem: { width: "30%", alignItems: "center", paddingVertical: 16, marginBottom: 12 },
  menuIconWrapper: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  menuIconBig: { width: "100%", height: "100%" ,  resizeMode: "contain", backgroundColor: "transparent" },
  menuLabel: { fontSize: 16, color: "rgba(27, 25, 25, 0.95)", textAlign: "center" },
  closeBtn: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 34,
    marginTop: 10,
  },
  closeBtnText: { fontSize:23, color: "rgba(49, 47, 47, 0.95)" },
});
