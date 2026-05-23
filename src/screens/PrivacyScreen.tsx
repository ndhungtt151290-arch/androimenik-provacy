import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showInterstitialChapter } from "../utils/AdManager";
import type { Lang } from "../types";

interface PrivacyScreenProps {
  lang: Lang;
  onBack: () => void;
}

const VI = {
  title: "Chính sách bảo mật",
  versions:
    "Áp dụng cho: Menki 1000+, Menki 1000+ Ôn Thi Xe Máy Nhật, Menki 1000+ 原付免許問題集",
  lastUpdated: "Cập nhật lần cuối: Tháng 5, 2026",
  intro:
    "Chào mừng bạn đến với Menki 1000+ (sau đây gọi tắt là \"Ứng dụng\"). Chúng tôi cam kết bảo vệ tuyệt đối quyền riêng tư và dữ liệu cá nhân của bạn. Bản Chính sách bảo mật này được thiết kế nhằm tuyên bố minh bạch cách ứng dụng xử lý dữ liệu, tuân thủ nghiêm ngặt các tiêu chuẩn an toàn pháp lý và quy định tại Mục 5.1 (Privacy) của Điều khoản Apple App Store Review Guidelines.",
  introJa:
    "Menki 1000+ アプリ（以下「当アプリ」）をご利用いただきありがとうございます。当アプリは、ユーザーのプライバシーおよび個人情報の保護を最優先に考えています。本プライバシーポリシーは、Apple App Store のレビュELINE（セクション5.1 - プライバシー）に厳格に準拠し、当アプリにおけるデータの取り扱いについて透明性をもって説明するものです。",
  section1Title: "1. THU THẬP THÔNG TIN CÁ NHÂN",
  section1P1:
    "Ứng dụng Menki 1000+ được xây dựng và hoạt động theo mô hình ứng dụng ngoại tuyến (Offline App).",
  section1P2:
    "Chúng tôi KHÔNG yêu cầu đăng ký tài khoản, KHÔNG thu thập, KHÔNG lưu trữ, KHÔNG theo dõi và KHÔNG chia sẻ bất kỳ thông tin nhận dạng cá nhân nào của người dùng dưới mọi hình thức (bao gồm nhưng không giới hạn: Họ tên, số điện thoại, email, địa chỉ, vị trí địa lý, số định danh thiết bị IMEI/IDFA).",
  section1P1Ja: "当アプリは、完全なオフラインアプリとして設計・運営されています。",
  section1P2Ja:
    "当アプリは、ユーザーのアカウント登録を一切要求せず、個人を特定できる情報（氏名、電話番号、メールアドレス、住所、位置情報、デバイス識別子 IMEI/IDFA などを含むがこれらに限定されない）を収集、保存、追跡、または共有することは一切ありません。",
  section2Title: "2. PHƯƠNG THỨC LƯU TRỮ DỮ LIỆU CỤC BỘ",
  section2P1:
    "Để phục vụ các tính năng học tập, mọi dữ liệu phát sinh trong quá trình sử dụng bao gồm: Lịch sử làm đề thi thử, tiến độ tiến trình ôn tập từng chương và danh sách \"Câu hỏi hay sai\" (Wrong Questions History) đều được lưu trữ hoàn toàn cục bộ (Local Storage) trên chính thiết bị của bạn thông qua bộ nhớ AsyncStorage.",
  section2P2:
    "Chúng tôi không sở hữu hệ thống máy chủ lưu trữ (Server) và không có bất kỳ quyền truy cập từ xa nào đối với dữ liệu học tập cá nhân này trên thiết bị của bạn.",
  section2P1Ja:
    "ユーザーの学習をサポートするため、当アプリの利用によって発生するすべてのデータ（模擬試験の履歴、章ごとの学習進捗、および「間違えた問題」のリストなど）は、デバイス上の AsyncStorage を通じて、ローカルストレージ（Local Storage）にのみ保存されます。",
  section2P2Ja:
    "当社は外部サーバーを保有しておらず、ユーザーのデバイス内にあるこれらの個人学習データにリモートでアクセスする権限や手段はありません。",
  section3Title: "3. QUYỀN SỞ HỮU VÀ XÓA DỮ LIỆU CỦA NGƯỜI DÙNG",
  section3P1:
    "Bạn có toàn quyền kiểm soát tối cao đối với dữ liệu của mình vì chúng nằm hoàn toàn trên thiết bị của bạn.",
  section3P2:
    "Khi bạn thực hiện hành động gỡ bỏ (Uninstall/Delete) ứng dụng Menki 1000+ khỏi thiết bị điện thoại, hệ điều hành (iOS/Android) sẽ tự động kích hoạt cơ chế xóa sạch 100% dữ liệu cục bộ liên quan đến ứng dụng. Không có bất kỳ bản sao lưu nào được giữ lại trên môi trường internet hoặc hệ thống mạng bên ngoài.",
  section3P1Ja: "すべてのデータはユーザーのデバイスに保存されているため、ユーザー自身が完全な管理権限を持ちます。",
  section3P2Ja:
    "ユーザーがデバイスから当アプリをアンインストール（削除）した場合、デバイスのOS（iOS/Android）の標準機能により、アプリに関連するローカルデータは100%自動的に完全消去されます。インターネット上や外部システムにバックアップやコピーが残ることは一切ありません。",
  section4Title: "4. DỊCH VỤ VÀ LIÊN KẾT CỦA BÊN THỨ BA",
  section4P1:
    "Ứng dụng Menki 1000+ cam kết không tích hợp bất kỳ mã theo dõi quảng cáo (Ad Tracking SDKs), không chứa các biểu ngữ quảng cáo thu thập hành vi người dùng (Targeted Ads) và không sử dụng các công cụ phân tích bên thứ ba gây ảnh hưởng đến quyền riêng tư của học viên.",
  section4P1Ja:
    "当アプリには、ユーザーのプライバシーに影響を与えるようなサードパーティの広告追跡コード（SDK）、行動収集目的のターゲティング広告、またはサードパーティのユーザー行動分析ツールは一切組み込まれていません。",
  section5Title: "5. CHÍNH SÁCH BẢO VỆ TRẺ EM",
  section5P1:
    "Ứng dụng hoàn toàn tuân thủ các quy định quốc tế về bảo vệ quyền riêng tư trực tuyến của trẻ em (COPPA). Do tính chất không thu thập bất kỳ dữ liệu nào, Ứng dụng Menki 1000+ an toàn tuyệt đối cho người dùng ở mọi lứa tuổi, bao gồm cả trẻ em dưới 13 tuổi.",
  section5P1Ja:
    "当道は、子どものオンラインプライバシー保護に関する国際的な規則（COPPAなど）を遵守しています。いかなる情報も収集しない特性上、当道は13歳未満のお子様を含むすべての年齢層のユーザーにとって完全に安全です。",
  section6Title: "6. ĐIỀU KHOẢN THAY ĐỔI VÀ THÔNG TIN LIÊN HỆ",
  section6P1:
    "Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để phù hợp với các nâng cấp tính năng của ứng dụng. Mọi thay đổi sẽ có hiệu lực ngay khi bản cập nhật mới nhất được đăng tải trên đường link này.",
  section6P2:
    "Nếu có bất kỳ câu hỏi, khiếu nại hoặc đóng góp ý kiến nào liên quan đến quyền riêng tư, vui lòng liên hệ với chúng tôi thông qua thông tin hỗ trợ nhà phát triển trên App Store hoặc thông qua tính năng \"Liên hệ\" trực tiếp được tích hợp bên trong Ứng dụng.",
  section6P1Ja:
    "当道は、機能のアップグレードに合わせて、本プライバシーポリシーを随時更新することがあります。変更は、このリンクに最新版が公開された時点で即座に有効となります。",
  section6P2Ja:
    "本プライバシーポリシーに関するご質問、苦情、またはご意見がございましたら、App Store に記載されているデベロッパーサポート情報、またはアプリ内の「お問い合わせ」項目よりご連絡ください。",
};

const JA = {
  title: "プライバシーポリシー",
  versions:
    "対象アプリ: Menki 1000+, Menki 1000+ Ôn Thi Xe Máy Nhật, Menki 1000+ 原付免許問題集",
  lastUpdated: "最終更新日：2026年5月",
  intro:
    "Menki 1000+ アプリ（以下「当アプリ」）をご利用いただきありがとうございます。当家は、ユーザーのプライバシーおよび個人情報の保護を最優先に考えています。本プライバシーポリシーは、Apple App Store のレビュELINE（セクション5.1 - プライバシー）に厳格に準拠し、当アプリにおけるデータの取り扱いについて透明性をもって説明するものです。",
  introJa:
    "Menki 1000+ アプリ（以下「当アプリ」）をご利用いただきありがとうございます。当家は、ユーザーのプライバシーおよび個人情報の保護を最優先に考えています。本プライバシーポリシーは、Apple App Store のレビュELINE（セクション5.1 - プライバシー）に厳格に準拠し、当アプリにおけるデータの取り扱いについて透明性をもって説明するものです。",
  section1Title: "1. 個人情報の収集について",
  section1P1: "当アプリは、完全なオフラインアプリとして設計・運営されています。",
  section1P2:
    "当アプリは、ユーザーのアカウント登録を一切要求せず、個人を特定できる情報（氏名、電話番号、メールアドレス、住所、位置情報、デバイス識別子 IMEI/IDFA などを含むがこれらに限定されない）を収集、保存、追跡、または共有することは一切ありません。",
  section1P1Ja: "当道は、完全なオフラインアプリとして設計・運営されています。",
  section1P2Ja:
    "当道は、ユーザーのアカウント登録を一切要求せず、個人を特定できる情報（氏名、電話番号、メールアドレス、住所、位置情報、デバイス識別子 IMEI/IDFA などを含むがこれらに限定されない）を収集、保存、追跡、または共有することは一切ありません。",
  section2Title: "2. ローカルデータの保存について",
  section2P1:
    "ユーザーの学習をサポートするため、当アプリの利用によって発生するすべてのデータ（模擬試験の履歴、章ごとの学習進捗、および「間違えた問題」のリストなど）は、デバイス上の AsyncStorage を通じて、ローカルストレージ（Local Storage）にのみ保存されます。",
  section2P2:
    "当社は外部サーバーを保有しておらず、ユーザーのデバイス内にあるこれらの個人学習データにリモートでアクセスする権限や手段はありません。",
  section2P1Ja:
    "ユーザーの学習をサポートするため、当アプリの利用によって発生するすべてのデータ（模擬試験の履歴、章ごとの学習進捗、および「間違えた問題」のリストなど）は、デバイス上の AsyncStorage を通じて、ローカルストレージ（Local Storage）にのみ保存されます。",
  section2P2Ja:
    "当社は外部サーバーを保有しておらず、ユーザーのデバイス内にあるこれらの個人学習データにリモートでアクセスする権限や手段はありません。",
  section3Title: "3. ユーザーのデータ管理および完全削除の権利",
  section3P1: "すべてのデータはユーザーのデバイスに保存されているため、ユーザー自身が完全な管理権限を持ちます。",
  section3P2:
    "ユーザーがデバイスから当アプリをアンインストール（削除）した場合、デバイスのOS（iOS/Android）の標準機能により、アプリに関連するローカルデータは100%自動的に完全消去されます。インターネット上や外部システムにバックアップやコピーが残ることは一切ありません。",
  section3P1Ja: "すべてのデータはユーザーのデバイスに保存されているため、ユーザー自身が完全な管理権限を持ちます。",
  section3P2Ja:
    "ユーザーがデバイスから当アプリをアンインストール（削除）した場合、デバイスのOS（iOS/Android）の標準機能により、アプリに関連するローカルデータは100%自動的に完全消去されます。インターネット上や外部システムにバックアップやコピーが残ることは一切ありません。",
  section4Title: "4. サードパーティサービスおよびリンクについて",
  section4P1:
    "当アプリには、ユーザーのプライバシーに影響を与えるようなサードパーティの広告追跡コード（SDK）、行動収集目的のターゲティング広告、またはサードパーティのユーザー行動分析ツールは一切組み込まれていません。",
  section4P1Ja:
    "当アプリには、ユーザーのプライバシーに影響を与えるようなサードパーティの広告追跡コード（SDK）、行動収集目的のターゲティング広告、またはサードパーティのユーザー行動分析ツールは一切組み込まれていません。",
  section5Title: "5. 子ども向けのプライバシー保護",
  section5P1:
    "当道は、子どものオンラインプライバシー保護に関する国際的な規則（COPPAなど）を遵守しています。いかなる情報も収集しない特性上、当道は13歳未満のお子様を含むすべての年齢層のユーザーにとって完全に安全です。",
  section5P1Ja:
    "当道は、子どものオンラインプライバシー保護に関する国際的な規則（COPPAなど）を遵守しています。いかなる情報も収集しない特性上、当道は13歳未満のお子様を含むすべての年齢層のユーザーにとって完全に安全です。",
  section6Title: "6. ポリシーの変更およびお問い合わせ",
  section6P1:
    "当道は、機能のアップグレードに合わせて、本プライバシーポリシーを随時更新ことがあります。変更は、このリンクに最新版が公開された時点で即座に有効となります。",
  section6P2:
    "本プライバシーポリシーに関するご質問、苦情、またはご意見がございましたら、App Store に記載されているデベロッパーサポート情報、またはアプリ内の「お問い合わせ」項目よりご連絡ください。",
  section6P1Ja:
    "当道は、機能のアップグレードに合わせて、本プライバシーポリシーを随時更新ることがあります。変更は、このリンクに最新版が公開された時点で即座に有効となります。",
  section6P2Ja:
    "本プライバシーポリシーに関するご質問、苦情、またはご意見がございましたら、App Store に記載されているデベロッパーサポート情報、またはアプリ内の「お問い合わせ」項目よりご連絡ください。",
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

export function PrivacyScreen({ lang, onBack }: PrivacyScreenProps) {
  const insets = useSafeAreaInsets();
  const T = lang === "vi" ? VI : JA;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{T.title}</Text>
      <Text style={styles.versions}>{T.versions}</Text>
      <Text style={styles.lastUpdated}>{T.lastUpdated}</Text>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        <BilingualText vi={T.intro} ja={T.introJa} />

        <SectionTitle>{T.section1Title}</SectionTitle>
        <BilingualText vi={T.section1P1} ja={T.section1P1Ja} />
        <BilingualText vi={T.section1P2} ja={T.section1P2Ja} />

        <SectionTitle>{T.section2Title}</SectionTitle>
        <BilingualText vi={T.section2P1} ja={T.section2P1Ja} />
        <BilingualText vi={T.section2P2} ja={T.section2P2Ja} />

        <SectionTitle>{T.section3Title}</SectionTitle>
        <BilingualText vi={T.section3P1} ja={T.section3P1Ja} />
        <BilingualText vi={T.section3P2} ja={T.section3P2Ja} />

        <SectionTitle>{T.section4Title}</SectionTitle>
        <BilingualText vi={T.section4P1} ja={T.section4P1Ja} />

        <SectionTitle>{T.section5Title}</SectionTitle>
        <BilingualText vi={T.section5P1} ja={T.section5P1Ja} />

        <SectionTitle>{T.section6Title}</SectionTitle>
        <BilingualText vi={T.section6P1} ja={T.section6P1Ja} />
        <BilingualText vi={T.section6P2} ja={T.section6P2Ja} />
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
    color: "#78350f",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  versions: {
    fontSize: 11,
    color: "#525252",
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#525252",
    textAlign: "center",
    marginBottom: 16,
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#78350f",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: "#1c1917",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  jaBlock: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#93c5fd",
  },
  jaText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
