import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Lang } from "../types";

interface PrivacyScreenProps {
  lang: Lang;
  onBack: () => void;
}

const VI = {
  title: "Chính sách bảo mật",
  versions: "Áp dụng: Menki 1000+, Menki 1000+ Ôn Thi Xe Máy Nhật, Menki 1000+ 原付免許問題集",
  lastUpdated: "Cập nhật: Tháng 5, 2026",
  intro:
    "Chào mừng bạn đến với Menki 1000+. Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách tuân thủ Google Play Developer Program Policies.",
  introJa:
    "Menki 1000+へようこそ。私たちはユーザーのプライバシー保護を最優先に考えております。本プライバシーポリシーはGoogle Play Developer Program Policiesに準拠しております。",
  section1Title: "1. THU THẬP THÔNG TIN",
  section1P1:
    "Menki 1000+ là ứng dụng ngoại tuyến (Offline). Chúng tôi KHÔNG thu thập thông tin cá nhân (họ tên, email, số điện thoại, vị trí GPS, IMEI/IDFA).",
  section1P1Ja:
    "Menki 1000+はオフラインアプリです。私たちは個人情報（氏名、メールアドレス、電話番号、位置情報、IMEI/IDFA）を一切収集致しません。",
  section2Title: "2. LƯU TRỮ DỮ LIỆU",
  section2P1:
    "Dữ liệu học tập (lịch sử thi, tiến độ ôn tập, câu hỏi hay sai) được lưu cục bộ trên thiết bị. Chúng tôi KHÔNG có server và KHÔNG truy cập từ xa.",
  section2P1Ja:
    "学習データ（試験履歴、進捗、間違えた問題など）はデバイスにローカル保存されます。私たちはサーバーを持たずリモートアクセス致しません。",
  section3Title: "3. QUẢNG CÁO ADMOB",
  section3P1:
    "Ứng dụng sử dụng Google AdMob để hiển thị quảng cáo. AdMob có thể thu thập: loại thiết bị, OS, dữ liệu sử dụng, vị trí ước tính.",
  section3P2: "Android: Settings → Google → Ads",
  section3P1Ja:
    "当어는Google AdMobを使用して広告を表示しています。AdMobはデバイスの種類、OS、使用データ、推定位置情報などを収集場合があります。",
  section3P2Ja: "Android：設定 → Google → 広告",
  section4Title: "4. XÓA DỮ LIỆU",
  section4P1:
    "Dữ liệu nằm hoàn toàn trên thiết bị bạn. Gỡ ứng dụng sẽ xóa 100% dữ liệu. Chúng tôi KHÔNG lưu bản sao trên server.",
  section4P1Ja:
    "データはユーザーのデバイスにのみ保存されます。アプリをアンインストールするとOSが自動Deletesします。サーバーにコピーは残りません。",
  section5Title: "5. TRẺ EM & GDPR",
  section5P1:
    "Tuân thủ COPPA (Hoa Kỳ) và GDPR (Châu Âu). An toàn cho mọi lứa tuổi, bao gồm trẻ em dưới 13 tuổi.",
  section5P1Ja:
    "COPPA（米国）およびGDPR（EU）を遵守しています。13歳未満のお子様を含むすべての年齢層のユーザーに安全です。",
  section6Title: "6. LIÊN HỆ",
  section6P1: "Hỗ trợ qua Zalo: https://zalo.me/07091033238",
  section6P1Ja: "Zaloでサポート：https://zalo.me/07091033238",
  websiteBtn: "Xem đầy đủ trên Website",
};

const JA = {
  title: "プライバシーポリシー",
  versions: "対象: Menki 1000+, Menki 1000+ Ôn Thi Xe Máy Nhật, Menki 1000+ 原付免許問題集",
  lastUpdated: "最終更新日：2026年5月",
  intro:
    "Menki 1000+へようこそ。私たちはユーザーのプライバシー保護を最優先に考えております。本プライバシーポリシーはGoogle Play Developer Program Policiesに準拠しております。",
  introJa:
    "Menki 1000+へようこそ。私たちはユーザーのプライバシー保護を最優先に考えております。本プライバシーポリシーはGoogle Play Developer Program Policiesに準拠しております。",
  section1Title: "1. 個人情報の収集",
  section1P1:
    "Menki 1000+はオフラインアプリです。私たちは個人情報（氏名、メールアドレス、電話番号、位置情報、IMEI/IDFA）を一切収集致しません。",
  section1P1Ja:
    "Menki 1000+はオフラインアプリです。私たちは個人情報（氏名、メールアドレス、電話番号、位置情報、IMEI/IDFA）を一切収集致しません。",
  section2Title: "2. データの保存",
  section2P1:
    "学習データ（試験履歴、進捗、間違えた問題など）はデバイスにローカル保存されます。私たちはサーバーを持たずリモートアクセス致しません。",
  section2P1Ja:
    "学習データ（試験履歴、進捗、間違えた問題など）はデバイスにローカル保存されます。私たちはサーバーを持たずリモートアクセス致しません。",
  section3Title: "3. ADMOB広告",
  section3P1:
    "当어는Google AdMobを使用して広告を表示しています。AdMobはデバイスの種類、OS、使用データ、推定位置情報などを収集場合があります。",
  section3P2: "Android：設定 → Google → 広告",
  section3P1Ja:
    "当어는Google AdMobを使用して広告を表示しています。AdMobはデバイスの種類、OS、使用データ、推定位置情報などを収集場合があります。",
  section3P2Ja: "Android：設定 → Google → 広告",
  section4Title: "4. データの削除",
  section4P1:
    "データはユーザーのデバイスにのみ保存されます。アプリをアンインストールするとOSが自動Deletesします。サーバーにコピーは残りません。",
  section4P1Ja:
    "データはユーザーのデバイスにのみ保存されます。アプリをアンインストールするとOSが自動Deletesします。サーバーにコピーは残りません。",
  section5Title: "5. 子ども＆GDPR",
  section5P1:
    "COPPA（米国）およびGDPR（EU）を遵守しています。13歳未満のお子様を含むすべての年齢層のユーザーに安全です。",
  section5P1Ja:
    "COPPA（米国）およびGDPR（EU）を遵守しています。13歳未満のお子様を含むすべての年齢層のユーザーに安全です。",
  section6Title: "6. お問い合わせ",
  section6P1: "Zaloでサポート：https://zalo.me/07091033238",
  section6P1Ja: "Zaloでサポート：https://zalo.me/07091033238",
  websiteBtn: "ウェブサイトで全文を見る",
};

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function BodyText({ children }: { children: string }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

function BilingualText({ vi, ja }: { vi: string; ja: string }) {
  return (
    <>
      <BodyText>{vi}</BodyText>
      <View style={styles.jaBlock}>
        <Text style={styles.jaText}>{ja}</Text>
      </View>
    </>
  );
}

export function PrivacyScreen({ lang }: PrivacyScreenProps) {
  const insets = useSafeAreaInsets();
  const T = lang === "vi" ? VI : JA;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{T.title}</Text>
      <Text style={styles.versions}>{T.versions}</Text>
      <Text style={styles.lastUpdated}>{T.lastUpdated}</Text>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <BilingualText vi={T.intro} ja={T.introJa} />

        <SectionTitle>{T.section1Title}</SectionTitle>
        <BilingualText vi={T.section1P1} ja={T.section1P1Ja} />

        <SectionTitle>{T.section2Title}</SectionTitle>
        <BilingualText vi={T.section2P1} ja={T.section2P1Ja} />

        <SectionTitle>{T.section3Title}</SectionTitle>
        <BilingualText vi={T.section3P1} ja={T.section3P1Ja} />
        <BodyText>{T.section3P2}</BodyText>
        <View style={styles.jaBlock}>
          <Text style={styles.jaText}>{T.section3P2Ja}</Text>
        </View>

        <SectionTitle>{T.section4Title}</SectionTitle>
        <BilingualText vi={T.section4P1} ja={T.section4P1Ja} />

        <SectionTitle>{T.section5Title}</SectionTitle>
        <BilingualText vi={T.section5P1} ja={T.section5P1Ja} />

        <SectionTitle>{T.section6Title}</SectionTitle>
        <BilingualText vi={T.section6P1} ja={T.section6P1Ja} />

        <TouchableOpacity
          style={styles.websiteBtn}
          activeOpacity={0.75}
          onPress={() =>
            Linking.openURL("https://ndhungtt151290-arch.github.io/menki1000-privacy/")
          }
        >
          <Text style={styles.websiteBtnText}>{T.websiteBtn}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0b3575",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  versions: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f2f5f",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: "#1a1a1a",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  jaBlock: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  jaText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 20,
  },
  websiteBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
  },
  websiteBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0b3575",
  },
});
