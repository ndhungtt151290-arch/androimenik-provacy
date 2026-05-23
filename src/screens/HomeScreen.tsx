import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BTN } from "../theme/buttonTokens";
import { IllustrationImage } from "../components/IllustrationImage";
import type { Lang, SimpleQuestion, WrongAnswerStats } from "../types";
import { tips } from "../data/tips";
import { procedure } from "../data/procedure";
import { examCenters } from "../data/examCenters";
import { uploadToImgur } from "../lib/imgur";
import { loadWrongAnswers } from "../lib/storage";
import { SoundManager } from "../lib/SoundManager";
import { logger } from "../utils/logger";
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from "../config/emailjs";

const bank = require("../data/questions").default;

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
const backIcon = require("../assets/home/back-icon.png");

const backButtonStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 40,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={backButtonStyles.container}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image source={backIcon} style={backButtonStyles.icon} />
  </TouchableOpacity>
);

interface HomeScreenProps {
  lang: Lang;
  onStartExam: () => void;
  onStartPractice: () => void;
}

export function HomeScreen({
  lang,
  onStartExam,
  onStartPractice,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [procedureModalVisible, setProcedureModalVisible] = useState(false);
  const [examCentersModalVisible, setExamCentersModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [bugReportModalVisible, setBugReportModalVisible] = useState(false);
  const [wrongAnswersModalVisible, setWrongAnswersModalVisible] = useState(false);
  const [wrongList, setWrongList] = useState<WrongAnswerStats[]>([]);
  const [wrongListLoading, setWrongListLoading] = useState(false);
  const [questionLocation, setQuestionLocation] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [expandedProvinceId, setExpandedProvinceId] = useState<string | null>(null);

  const L = {
    chinhSachBaoMat: lang === "vi" ? "Chính sách bảo mật" : "プライバシーポリシー",
  };

  const onShowChinhSachBaoMat = async () => {
    await WebBrowser.openBrowserAsync(
      "https://ndhungtt151290-arch.github.io/menki1000-privacy/"
    );
  };

  // Load wrong answers when modal opens
  useEffect(() => {
    if (wrongAnswersModalVisible) {
      let cancelled = false;
      setWrongListLoading(true);

      const loadWithTimeout = async (): Promise<void> => {
        const maxRetries = 2;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const data = await loadWrongAnswers();
            clearTimeout(timeoutId);

            if (!cancelled) {
              setWrongList(data);
              setWrongListLoading(false);
              return;
            }
            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (lastError.name === "AbortError" || attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 300));
              continue;
            }
            break;
          }
        }

        if (!cancelled) {
          logger.warn("[HomeScreen] Failed to load wrong answers after retries:", lastError);
          setWrongList([]);
          setWrongListLoading(false);
        }
      };

      loadWithTimeout();

      return () => {
        cancelled = true;
      };
    }
  }, [wrongAnswersModalVisible]);

  // Sorted wrong answers list
  const sortedWrongList = useMemo(() => {
    return [...wrongList].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [wrongList]);

  // Question map for quick lookup
  const questionMap = useMemo(() => {
    const map = new Map<string, SimpleQuestion>();
    for (const item of wrongList) {
      const q = bank.simple.find((sq: SimpleQuestion) => sq.id === item.questionId);
      if (q) map.set(item.questionId, q);
    }
    return map;
  }, [wrongList]);

 
  const handleOpenZalo = async () => {
    const zaloUrl = "https://zalo.me/07091033238";
    try {
      const supported = await Linking.canOpenURL(zaloUrl);
      if (supported) {
        await Linking.openURL(zaloUrl);
      } else {
        Alert.alert(
          lang === "vi" ? "Không thể mở Zalo" : "Zaloを開けます",
          lang === "vi"
            ? "Vui lòng cài đặt ứng dụng Zalo trên thiết bị."
            : "デバイスにZaloアプリがインストールされていません。"
        );
      }
    } catch (error) {
      Alert.alert(
        lang === "vi" ? "Đã xảy ra lỗi" : "エラーが発生しました",
        lang === "vi"
          ? "Không thể mở liên kết Zalo. Vui lòng thử lại."
          : "Zaloリンクを開けませんでした。もう一度お試しください。"
      );
    }
  };

  const handleOpenFacebook = async () => {
    const facebookUrl = "https://www.facebook.com/share/g/1B4bSC5yBr/";
    try {
      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        Alert.alert(
          lang === "vi" ? "Không thể mở Facebook" : "Facebookを開けます",
          lang === "vi"
            ? "Vui lòng cài đặt ứng dụng Facebook trên thiết bị."
            : "デバイスにFacebookアプリがインストールされていません。"
        );
      }
    } catch (error) {
      Alert.alert(
        lang === "vi" ? "Đã xảy ra lỗi" : "エラーが発生しました",
        lang === "vi"
          ? "Không thể mở liên kết Facebook. Vui lòng thử lại."
          : "Facebookリンクを開けませんでした。もう一度お試しください。"
      );
    }
  };

  const menuItems = [
    { id: 1, label: lang === "vi" ? "Câu hỏi hay sai" : "○×問題", icon: iconQuestion },
    { id: 2, label: lang === "vi" ? "Mẹo ghi nhớ" : "記憶のコツ", icon: iconTip },
    { id: 3, label: lang === "vi" ? "Thủ tục thi" : "試験手続き", icon: iconProcedure },
    { id: 4, label: lang === "vi" ? "Địa điểm thi" : "試験場所", icon: iconLocation },
    { id: 5, label: lang === "vi" ? "Liên hệ" : "お問い合わせ", icon: iconContact },
    { id: 6, label: lang === "vi" ? "Báo lỗi câu hỏi" : "問題の報告", icon: iconBug },
  ];

  const contactInfo = {
    vi: {
      title: "VỀ GENTSUKI & HỖ TRỢ",
      intro: "Chào bạn! Gentsuki là ứng dụng ôn thi bằng lái xe máy 50cc được phát triển chuyên biệt dành riêng cho cộng đồng người Việt tại Nhật Bản.\n\nVới sứ mệnh giúp bạn vượt qua kỳ thi lý thuyết một cách dễ dàng và tự tin nhất, ứng dụng tích hợp bộ câu hỏi sát thực tế, hệ thống tình huống thông minh và mẹo ghi nhớ độc quyền. Chúc bạn ôn tập thật tốt và sớm cầm tấm bằng lái trên tay!",
      contactTitle: "KẾT NỐI VÀ BÁO LỖI",
      contactIntro: "Nếu bạn gặp trục trặc về kỹ thuật, phát hiện lỗi sai trong câu hỏi, hoặc muốn tham gia cộng đồng chia sẻ kinh nghiệm đỗ bằng, hãy liên hệ với Admin qua các kênh sau:",
      facebookBtn: "Tham gia cộng đồng Facebook",
      zaloBtn: "Hỗ trợ kỹ thuật qua Zalo",
      closeBtn: "Đóng",
    },
    jp: {
      title: "GENTSUKIについて&サポート",
      intro: "Gentsukiへようこそ！Gentsukiは、ベトナム人在住者向けの原動機付自転車（原付）50cc免itanoを取得するための試験対策アプリです。\n\n筆記試験を簡単に突破できるよう、リアルな問題セット、スマートなシナリオシステム、独占的な記憶コツなどを搭載しています。勉強頑張って、早く免itanoを取得しましょう！",
      contactTitle: "接続とエラー報告",
      contactIntro: " technicalな問題を発見した場合、問題の誤りを見つけた場合、または免itano取得した経験を持つコミュニティに参加したい場合は、以下の方法でAdminにお問い合わせください：",
      facebookBtn: "Facebookコミュニティに参加",
      zaloBtn: "Zaloでサポートを受ける",
      closeBtn: "閉じる",
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerImages}>
          <Image source={imgS1} style={styles.headerLogo} />
          <Image source={imgS2} style={styles.headerHero} />
        </View>
      </View>

      <View style={styles.buttonSection}>
        <View style={styles.buttonCenterWrapper}>
          <View style={styles.actionBtnContainer}>
            <TouchableOpacity onPress={() => { SoundManager.playTapClick(); onStartExam(); }} style={styles.actionBtn} activeOpacity={0.8}>
              <Image source={imgS3} style={styles.actionImage} />
              <View style={styles.actionOverlay}>
                <Text style={styles.actionText}>
                  {lang === "vi" ? "Vào phòng thi" : "模擬試験スタート"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { SoundManager.playTapClick(); onStartPractice(); }} style={styles.actionBtn} activeOpacity={0.8}>
              <Image source={imgS3_1} style={styles.actionImage} />
              <View style={styles.actionOverlay}>
                <Text style={styles.actionText}>
                  {lang === "vi" ? "Luyện tập" : "練習"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { SoundManager.playTapClick(); setMenuVisible(true); }} activeOpacity={0.8}>
              <Image source={imgMenu} style={styles.menuIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.bottomRow, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity onPress={onShowChinhSachBaoMat} activeOpacity={0.7}>
          <Text style={styles.privacyLink}>{L.chinhSachBaoMat}</Text>
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
            <Text style={styles.sheetTitle}>{lang === "vi" ? "Menu" : "メニュー"}</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.id === 1) {
                      setMenuVisible(false);
                      setWrongAnswersModalVisible(true);
                    } else if (item.id === 2) {
                      setMenuVisible(false);
                      setTipModalVisible(true);
                    } else if (item.id === 3) {
                      setMenuVisible(false);
                      setProcedureModalVisible(true);
                    } else if (item.id === 4) {
                      setMenuVisible(false);
                      setExamCentersModalVisible(true);
                    } else if (item.id === 5) {
                      setMenuVisible(false);
                      setSupportModalVisible(true);
                    } else if (item.id === 6) {
                      setMenuVisible(false);
                      setBugReportModalVisible(true);
                    }
                  }}
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

      {/* Tips Modal */}
      <Modal
        visible={tipModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTipModalVisible(false)}
      >
        <View style={styles.tipOverlay}>
          <TouchableOpacity
            style={styles.tipOverlayTouch}
            activeOpacity={1}
            onPress={() => setTipModalVisible(false)}
          />
          <View style={styles.tipSheet}>
            <View style={styles.tipHeaderRow}>
              <BackButton onPress={() => { setTipModalVisible(false); setMenuVisible(true); }} />
              <Text style={styles.tipTitle}>{tips[lang].title}</Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tipScrollContent}
            >
              <Text style={styles.tipIntro}>{tips[lang].intro}</Text>
              {tips[lang].sections.map((section, index) => (
                <View key={index} style={styles.tipSection}>
                  <Text style={styles.tipSectionHeading}>{section.heading}</Text>
                  <Text style={styles.tipSectionContent}>{section.content}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Procedure Modal */}
      <Modal
        visible={procedureModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProcedureModalVisible(false)}
      >
        <View style={styles.procedureOverlay}>
          <TouchableOpacity
            style={styles.procedureOverlayTouch}
            activeOpacity={1}
            onPress={() => setProcedureModalVisible(false)}
          />
          <View style={styles.procedureSheet}>
            <View style={styles.procedureHeaderRow}>
              <BackButton onPress={() => { setProcedureModalVisible(false); setMenuVisible(true); }} />
              <Text style={styles.procedureTitle}>{procedure[lang].title}</Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.procedureScrollContent}
            >
              <Text style={styles.procedureIntro}>{procedure[lang].intro}</Text>
              {procedure[lang].sections.map((section, index) => (
                <View key={index} style={styles.procedureSection}>
                  <Text style={styles.procedureSectionHeading}>{section.heading}</Text>
                  <Text style={styles.procedureSectionContent}>{section.content}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Wrong Answers Modal */}
      <Modal
        visible={wrongAnswersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWrongAnswersModalVisible(false)}
      >
        <View style={styles.wrongAnswersOverlay}>
          <TouchableOpacity
            style={styles.wrongAnswersOverlayTouch}
            activeOpacity={1}
            onPress={() => setWrongAnswersModalVisible(false)}
          />
          <View style={styles.wrongAnswersSheet}>
            <View style={styles.wrongAnswersHeaderRow}>
              <BackButton onPress={() => { setWrongAnswersModalVisible(false); setMenuVisible(true); }} />
              <Text style={styles.wrongAnswersTitle}>
                {lang === "vi" ? "Câu hỏi hay sai" : "○×問題"}
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.wrongAnswersScrollContent}
            >
              {wrongListLoading ? (
                <View style={styles.wrongAnswersLoading}>
                  <ActivityIndicator size="small" color="#78350f" />
                </View>
              ) : sortedWrongList.length === 0 ? (
                <View style={styles.wrongAnswersEmpty}>
                  <Text style={styles.wrongAnswersEmptyIcon}>📝</Text>
                  <Text style={styles.wrongAnswersEmptyText}>
                    {lang === "vi"
                      ? "Tuyệt vời! Bạn chưa có câu hỏi sai nào. Hãy tiếp tục ôn tập nhé!"
                      : "間違えた問題がありません！"}
                  </Text>
                  <Text style={styles.wrongAnswersEmptySubtext}>
                    {lang === "vi"
                      ? ""
                      : "練習を続けて覚えましょう。"}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.wrongAnswersSubtitle}>
                    {lang === "vi"
                      ? `${sortedWrongList.length} câu cần ôn tập`
                      : `${sortedWrongList.length}問の復習`}
                  </Text>
                  {sortedWrongList.map((item) => {
                    const question = questionMap.get(item.questionId);
                    if (!question) return null;
                    const getBadgeColor = (count: number) => {
                      if (count >= 4) return "#dc2626";
                      if (count >= 3) return "#ea580c";
                      return "#d97706";
                    };
                    return (
                      <View key={item.questionId} style={styles.wrongAnswerCard}>
                        <View style={styles.wrongAnswerCardHeader}>
                          <View
                            style={[
                              styles.wrongBadge,
                              { backgroundColor: getBadgeColor(item.wrongCount) },
                            ]}
                          >
                            <Text style={styles.wrongBadgeText}>
                              {lang === "vi" ? "Sai" : "不正解"}
                            </Text>
                            <Text style={styles.wrongCountText}>
                              {item.wrongCount}x
                            </Text>
                          </View>
                        </View>
                        {question.image && (
                          <IllustrationImage
                            file={question.image}
                            style={styles.wrongAnswerImage}
                            imageStyle={styles.wrongAnswerImageInner}
                          />
                        )}
                        <Text style={styles.wrongAnswerQuestionText}>
                          {lang === "vi" && question.textVi
                            ? question.textVi
                            : question.text}
                        </Text>
                        <View style={styles.wrongAnswerSection}>
                          <View style={styles.wrongAnswerRow}>
                            <Text style={styles.wrongAnswerLabel}>
                              {lang === "vi" ? "Đáp án đúng:" : "正解："}
                            </Text>
                            <Text
                              style={[
                                styles.wrongAnswerValue,
                                question.answer === "○"
                                  ? styles.answerO
                                  : styles.answerX,
                              ]}
                            >
                              {question.answer === "○" ? "O" : "X"}
                            </Text>
                          </View>
                          <View style={styles.wrongAnswerExplanationBox}>
                            <Text style={styles.wrongAnswerExplanationLabel}>
                              {lang === "vi" ? "Giải thích:" : "解説："}
                            </Text>
                            <Text style={styles.wrongAnswerExplanationText}>
                              {lang === "vi" && question.explanationVi
                                ? question.explanationVi
                                : question.explanation}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Exam Centers Modal */}
      <Modal
        visible={examCentersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExamCentersModalVisible(false)}
      >
        <View style={styles.examCentersOverlay}>
          <TouchableOpacity
            style={styles.examCentersOverlayTouch}
            activeOpacity={1}
            onPress={() => setExamCentersModalVisible(false)}
          />
          <View style={styles.examCentersSheet}>
            <View style={styles.examCentersHeaderRow}>
              <BackButton onPress={() => { setExamCentersModalVisible(false); setMenuVisible(true); }} />
              <Text style={styles.examCentersTitle}>
                {lang === "vi" ? "Địa điểm thi" : "試験場所"}
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.examCentersScrollContent}
            >
              {examCenters[lang].map((region) => (
                <View key={region.id} style={styles.regionContainer}>
                  <Text style={styles.regionHeader}>{region.name}</Text>
                  {region.provinces.map((province) => (
                    <View key={province.id}>
                      <TouchableOpacity
                        style={styles.provinceRow}
                        activeOpacity={0.7}
                        onPress={() => {
                          setExpandedProvinceId(
                            expandedProvinceId === province.id ? null : province.id
                          );
                        }}
                      >
                        <Text style={styles.provinceName}>{province.name}</Text>
                        <Text style={styles.expandIcon}>
                          {expandedProvinceId === province.id ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>

                      {expandedProvinceId === province.id && (
                        <View style={styles.provinceExpanded}>
                          {province.reason && (
                            <Text style={styles.reasonText}>{province.reason}</Text>
                          )}
                          <View style={styles.centerInfo}>
                            <Text style={styles.centerName}>
                              {province.center.name}
                            </Text>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>
                                {lang === "vi" ? "Địa chỉ: " : "住所: "}
                              </Text>
                              <Text style={styles.detailValue}>
                                {province.center.address}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>
                                {lang === "vi" ? "Cách đi: " : "行き方: "}
                              </Text>
                              <Text style={styles.detailValue}>
                                {province.center.howToGo}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.mapLinkBtn}
                              activeOpacity={0.7}
                              onPress={() => {
                                const { Linking } = require("react-native");
                                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  province.center.mapQuery
                                )}`;
                                Linking.openURL(url);
                              }}
                            >
                              <Text style={styles.mapLinkBtnText}>
                                {lang === "vi" ? "📍 Mở Bản đồ" : "📍 地図を開く"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {province.additionalCenters && province.additionalCenters.map((addCenter, idx) => (
                            <View key={idx} style={[styles.centerInfo, styles.additionalCenterInfo]}>
                              <Text style={styles.centerName}>{addCenter.name}</Text>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                  {lang === "vi" ? "Địa chỉ: " : "住所: "}
                                </Text>
                                <Text style={styles.detailValue}>{addCenter.address}</Text>
                              </View>
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                  {lang === "vi" ? "Cách đi: " : "行き方: "}
                                </Text>
                                <Text style={styles.detailValue}>{addCenter.howToGo}</Text>
                              </View>
                              <TouchableOpacity
                                style={styles.mapLinkBtn}
                                activeOpacity={0.7}
                                onPress={() => {
                                  const { Linking } = require("react-native");
                                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    addCenter.mapQuery
                                  )}`;
                                  Linking.openURL(url);
                                }}
                              >
                                <Text style={styles.mapLinkBtnText}>
                                  {lang === "vi" ? "📍 Mở Bản đồ" : "📍 地図を開く"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Support Modal */}
      <Modal
        visible={supportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSupportModalVisible(false)}
      >
        <View style={styles.supportOverlay}>
          <TouchableOpacity
            style={styles.supportOverlayTouch}
            activeOpacity={1}
            onPress={() => setSupportModalVisible(false)}
          />
          <View style={styles.supportSheet}>
            <View style={styles.supportHeaderRow}>
              <BackButton onPress={() => { setSupportModalVisible(false); setMenuVisible(true); }} />
              <Text style={styles.supportTitle}>
                {contactInfo[lang].title}
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.supportScrollContent}
            >
              <Text style={styles.supportIntro}>
                {contactInfo[lang].intro}
              </Text>
              <Text style={styles.supportContactTitle}>
                {contactInfo[lang].contactTitle}
              </Text>
              <Text style={styles.supportContactIntro}>
                {contactInfo[lang].contactIntro}
              </Text>

              <TouchableOpacity
                style={styles.supportBtn}
                activeOpacity={0.7}
                onPress={handleOpenFacebook}
              >
                <Text style={styles.supportBtnText}>
                  {contactInfo[lang].facebookBtn}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportBtn}
                activeOpacity={0.7}
                onPress={handleOpenZalo}
              >
                <Text style={styles.supportBtnText}>
                  {contactInfo[lang].zaloBtn}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bug Report Modal */}
      <Modal
        visible={bugReportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBugReportModalVisible(false)}
      >
        <View style={styles.bugReportOverlay}>
          <TouchableOpacity
            style={styles.bugReportOverlayTouch}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setBugReportModalVisible(false);
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.bugReportSheet}
          >
            <View style={styles.bugReportHeaderRow}>
              <BackButton onPress={() => {
                Keyboard.dismiss();
                setBugReportModalVisible(false);
                setQuestionLocation("");
                setErrorDescription("");
                setSelectedImage(null);
                setMenuVisible(true);
              }} />
              <Text style={styles.bugReportTitle}>
                {lang === "vi" ? "Báo lỗi câu hỏi" : "問題のエラー報告"}
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bugReportScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.bugReportInput}
                placeholder={lang === "vi" ? "Tiêu đề ..." : "タイトル..."}
                placeholderTextColor="#999"
                value={questionLocation}
                onChangeText={setQuestionLocation}
              />

              <TextInput
                style={[styles.bugReportInput, styles.bugReportInputMulti]}
                placeholder={lang === "vi" ? "Mô tả chi tiết lỗi..." : "詳細な説明..."}
                placeholderTextColor="#999"
                value={errorDescription}
                onChangeText={setErrorDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.bugReportAttachBtn}
                activeOpacity={0.7}
                onPress={async () => {
                  const { status: rawStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  const status: string = rawStatus;
                  if (status !== "granted" && status !== "limited") {
                    Alert.alert(
                      lang === "vi" ? "Cần quyền truy cập" : "アクセス許可が必要",
                      lang === "vi" ? "Vui lòng cho phép truy cập thư viện ảnh" : "写真ライブラリへのアクセスを許可してください"
                    );
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    quality: 0.8,
                  });
                  if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
                    setSelectedImage(result.assets[0].uri);
                  }
                }}
              >
                <Text style={styles.bugReportAttachBtnIcon}>📎</Text>
                <Text style={styles.bugReportAttachBtnText}>
                  {lang === "vi" ? "Đính kèm ảnh chụp màn hình" : "スクリーンショットを添付"}
                </Text>
              </TouchableOpacity>

              {selectedImage && (
                <View style={styles.bugReportImagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.bugReportThumbnail} />
                  <TouchableOpacity
                    style={styles.bugReportImageDelete}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text style={styles.bugReportImageDeleteText}>X</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.bugReportSubmitBtn,
                  isSubmittingBug && styles.bugReportSubmitBtnDisabled,
                ]}
                activeOpacity={0.8}
                disabled={isSubmittingBug}
                onPress={async () => {
                  if (!questionLocation.trim() || !errorDescription.trim()) {
                    Alert.alert(
                      lang === "vi" ? "Thiếu thông tin" : "情報が不足しています",
                      lang === "vi" ? "Vui lòng nhập đầy đủ thông tin" : "すべて入力してください"
                    );
                    return;
                  }

                  setIsSubmittingBug(true);

                  try {
                    // Upload ảnh lên Imgur nếu có ảnh được chọn
                    let imageUrl = lang === "vi" ? "Không có ảnh" : "画像なし";

                    if (selectedImage) {
                      const uploadResult = await uploadToImgur(selectedImage);
                      if (uploadResult.success && uploadResult.url) {
                        imageUrl = uploadResult.url;
                      } else {
                        Alert.alert(
                          lang === "vi" ? "Lỗi upload ảnh" : "画像アップロードエラー",
                          uploadResult.error || (lang === "vi" ? "Không thể upload ảnh" : "画像をアップロードできません")
                        );
                        setIsSubmittingBug(false);
                        return;
                      }
                    }

                    // Gửi email qua EmailJS sử dụng REST API
                    const emailResponse = await fetch(
                      "https://api.emailjs.com/api/v1.0/email/send",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          service_id: EMAILJS_SERVICE_ID,
                          template_id: EMAILJS_TEMPLATE_ID,
                          user_id: EMAILJS_PUBLIC_KEY,
                          template_params: {
                            question_location: questionLocation.trim(),
                            error_description: errorDescription.trim(),
                            image_url: selectedImage ? imageUrl : "",
                            created_at: new Date().toLocaleString("vi-VN"),
                          },
                        }),
                      }
                    );

                    if (!emailResponse.ok) {
                      const errorText = await emailResponse.text();
                      throw new Error(`EmailJS Error: ${errorText}`);
                    }

                    setQuestionLocation("");
                    setErrorDescription("");
                    setSelectedImage(null);
                    setBugReportModalVisible(false);
                    Alert.alert(
                      lang === "vi" ? "Cảm ơn bạn!" : "ありがとう！",
                      lang === "vi"
                        ? "Báo lỗi đã được gửi đến đội ngũ phát triển."
                        : "エラー報告は開発チームに送信されました。"
                    );
                  } catch (error: any) {
                    logger.error("EmailJS Error:", {
                      message: error?.message,
                      code: error?.code,
                      status: error?.status,
                      text: error?.text,
                      stack: error?.stack,
                    });
                    if (error.name === "AbortError") {
                      Alert.alert(
                        lang === "vi" ? "Hết thời gian chờ" : "タイムアウト",
                        lang === "vi"
                          ? "Kết nối mạng quá chậm. Vui lòng thử lại."
                          : "接続がタイムアウトしました。再試行してください。"
                      );
                    } else {
                      Alert.alert(
                        lang === "vi" ? "Lỗi mạng" : "ネットワークエラー",
                        lang === "vi" ? "Không thể gửi báo lỗi. Vui lòng thử lại." : "報告を送信できませんでした。再試行してください。"
                      );
                    }
                  } finally {
                    setIsSubmittingBug(false);
                  }
                }}
              >
                {isSubmittingBug ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.bugReportSubmitBtnText}>
                    {lang === "vi" ? "Gửi báo lỗi" : "エラー報告を送信"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    height:250,
    justifyContent: "center",
  },
  headerImages: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  headerLogo: { 
    overflow: "visible", 
    width: 190, 
    height: 140,
  },
  headerHero: { 
    marginTop: 10,
    height: 90, 
    width: 330,
  },
  buttonCenterWrapper: {
    alignItems: "center",
  },
  buttonSection: {
    marginTop: 20,
    paddingBottom: 0,
  },
  actionBtnContainer: { 
    alignItems: "center", 
    justifyContent: "center",
    gap: BTN.gapBetweenBtns,
  },
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
  bottomRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
    zIndex: 1,
  },
  privacyLink: { fontSize: 12, color: "rgb(1, 6, 19)", textDecorationLine: "underline" },
  credit: { fontSize: 9, color: "rgba(0, 0, 0, 0.95)", fontWeight: "600", letterSpacing: 5 },
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
  sheetTitle: { fontSize: 20,color: "rgba(0, 0, 0, 0.79)", fontWeight: "bold", textAlign: "center", marginBottom: 10,marginTop: 16 },
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

  // Tips Modal Styles
  tipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  tipOverlayTouch: { flex: 1 },
  tipSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tipScrollContent: {
    paddingBottom: 16,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginTop: 6,
  },
  tipIntro: {
    fontSize: 14,
    lineHeight: 22,
    color: "#404040",
    marginBottom: 16,
  },
  tipSection: {
    marginBottom: 16,
  },
  tipSectionHeading: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1917",
    marginBottom: 6,
  },
  tipSectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#404040",
  },
  tipCloseBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  tipCloseBtnText: {
    fontSize: 16,
    color: "#525252",
    fontWeight: "600",
  },
  tipHeaderRow: {
    position: "relative",
    paddingVertical: 12,
    paddingHorizontal: 4,
    justifyContent: "center",
  },

  // Procedure Modal Styles
  procedureOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  procedureOverlayTouch: { flex: 1 },
  procedureSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  procedureScrollContent: {
    paddingBottom: 16,
  },
  procedureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 16,
    marginTop:6,
  },
  procedureIntro: {
    fontSize: 14,
    lineHeight: 22,
    color: "#404040",
    marginBottom: 16,
  },
  procedureSection: {
    marginBottom: 16,
  },
  procedureSectionHeading: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1917",
    marginBottom: 6,
  },
  procedureSectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#404040",
  },
  procedureCloseBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  procedureCloseBtnText: {
    fontSize: 16,
    color: "#525252",
    fontWeight: "600",
  },
  procedureHeaderRow: {
    position: "relative",
    paddingVertical: 12,
    paddingHorizontal: 4,
    justifyContent: "center",
  },

  // Exam Centers Modal Styles
  examCentersOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  examCentersOverlayTouch: { flex: 1 },
  examCentersSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  examCentersScrollContent: {
    paddingBottom: 16,
  },
  examCentersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(8, 9, 70)",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 6,
  },
  regionContainer: {
    marginBottom: 20,
  },
  regionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0a2980",
    backgroundColor: "rgba(217, 223, 240, 0.23)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  provinceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  provinceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1c1917",
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  provinceExpanded: {
    backgroundColor: "rgba(250, 250, 250, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#525252",
    marginBottom: 12,
    fontStyle: "italic",
  },
  centerInfo: {
    gap: 8,
  },
  additionalCenterInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  centerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgb(8, 126, 8)",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1917",
    minWidth: 60,
  },
  detailValue: {
    fontSize: 13,
    lineHeight: 20,
    color: "#404040",
    flex: 1,
  },
  mapLinkBtn: {
    backgroundColor: "rgba(10, 41, 128, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(10, 41, 128, 0.2)",
  },
  mapLinkBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a2980",
  },
  examCentersCloseBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  examCentersCloseBtnText: {
    fontSize: 16,
    color: "#525252",
    fontWeight: "600",
  },
  examCentersHeaderRow: {
    position: "relative",
    paddingVertical: 12,
    paddingHorizontal: 4,
    justifyContent: "center",
  },

  // Support Modal Styles
  supportOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  supportOverlayTouch: { flex: 1 },
  supportSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  supportScrollContent: {
    paddingBottom: 16,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 6,
  },
  supportIntro: {
    fontSize: 14,
    lineHeight: 22,
    color: "#404040",
    marginBottom: 24,
  },
  supportContactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a2980",
    marginBottom: 8,
  },
  supportContactIntro: {
    fontSize: 14,
    lineHeight: 22,
    color: "#404040",
    marginBottom: 16,
  },
  supportBtn: {
    backgroundColor: "rgba(10, 41, 128, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(10, 41, 128, 0.2)",
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a2980",
  },
  supportCloseBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  supportCloseBtnText: {
    fontSize: 16,
    color: "#525252",
    fontWeight: "600",
  },
  supportHeaderRow: {
    position: "relative",
    paddingVertical: 12,
    paddingHorizontal: 4,
    justifyContent: "center",
  },

  // Wrong Answers Modal Styles
  wrongAnswersOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  wrongAnswersOverlayTouch: { flex: 1 },
  wrongAnswersSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  wrongAnswersScrollContent: {
    paddingBottom: 16,
  },
  wrongAnswersTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 6,
  },
  wrongAnswersSubtitle: {
    fontSize: 14,
    color: "#525252",
    textAlign: "center",
    marginBottom: 16,
  },
  wrongAnswersLoading: {
    paddingVertical: 32,
    alignItems: "center",
  },
  wrongAnswersEmpty: {
    paddingVertical: 32,
    alignItems: "center",
  },
  wrongAnswersEmptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  wrongAnswersEmptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1917",
    textAlign: "center",
    marginBottom: 8,
  },
  wrongAnswersEmptySubtext: {
    fontSize: 14,
    color: "#525252",
    textAlign: "center",
  },
  wrongAnswerCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  wrongAnswerCardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  wrongBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  wrongBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  wrongCountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  wrongAnswerImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  wrongAnswerImageInner: { width: "100%", height: 80, borderRadius: 8 },
  wrongAnswerQuestionText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: "#111",
    marginBottom: 10,
    textAlign: "center",
  },
  wrongAnswerSection: {
    backgroundColor: "rgba(120,53,15,0.05)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(120,53,15,0.15)",
  },
  wrongAnswerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  wrongAnswerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1917",
  },
  wrongAnswerValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  answerO: {
    color: "#16a34a",
  },
  answerX: {
    color: "#dc2626",
  },
  wrongAnswerExplanationBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(120,53,15,0.15)",
  },
  wrongAnswerExplanationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#78350f",
    marginBottom: 3,
  },
  wrongAnswerExplanationText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#404040",
  },
  wrongAnswersCloseBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  wrongAnswersCloseBtnText: {
    fontSize: 16,
    color: "#525252",
    fontWeight: "600",
  },
  wrongAnswersHeaderRow: {
    position: "relative",
    paddingVertical: 12,
    paddingHorizontal: 4,
    justifyContent: "center",
  },

  // Bug Report Modal Styles
  bugReportOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  bugReportOverlayTouch: { flex: 1 },
  bugReportSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bugReportScrollContent: {
    paddingBottom: 16,
  },
  bugReportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "center",
  },
  bugReportInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1c1917",
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  bugReportInputMulti: {
    height: 100,
  },
  bugReportAttachBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#0a2980",
    borderRadius: 12,
    marginTop: 8,
    borderStyle: "dashed",
    backgroundColor: "rgba(10, 41, 128, 0.05)",
  },
  bugReportAttachBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  bugReportAttachBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a2980",
  },
  bugReportImagePreview: {
    position: "relative",
    alignSelf: "center",
    marginTop: 16,
  },
  bugReportThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  bugReportImageDelete: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  bugReportImageDeleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  bugReportSubmitBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  bugReportSubmitBtnDisabled: {
    opacity: 0.7,
  },
  bugReportSubmitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bugReportCloseBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  bugReportCloseBtnText: {
    fontSize: 16,
    color: "#525252",
    fontWeight: "600",
  },
  bugReportHeaderRow: {
    position: "relative",
    paddingVertical: 20,
    paddingHorizontal: 4,
    justifyContent: "center",
  },
});
