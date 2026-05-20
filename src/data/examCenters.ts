import type { Lang } from "../types";

interface ExamCenter {
  name: string;
  address: string;
  howToGo: string;
  mapQuery: string;
}

interface Province {
  id: string;
  name: string;
  nameJp: string;
  reason?: string;
  reasonJp?: string;
  center: ExamCenter;
  additionalCenters?: ExamCenter[];
}

interface Region {
  id: string;
  name: string;
  nameJp: string;
  provinces: Province[];
}

export const examCenters: Record<Lang, Region[]> = {
  vi: [
    {
      id: "tokai",
      name: "1. Vùng TOKAI / CHUBU",
      nameJp: "1. 東海地方",
      provinces: [
        {
          id: "aichi",
          name: "Tỉnh AICHI (愛知県)",
          nameJp: "愛知県",
          reason: "Tỉnh Aichi (Nagoya) là một trong những nơi có số lượng người Việt sinh sống đông nhất nước Nhật.",
          reasonJp: "愛知県（名古屋）は日本にいるベトナム人コミュニティーが最も多く住む地域のひとつです。",
          center: {
            name: "Trung tâm sát hạch Hirabari (平針運転免許試験場)",
            address: "〒468-8513 愛知県名古屋市天白区平針南3丁目605",
            howToGo: "Từ Ga Hirabari (平針駅) trên tuyến Subway Tsurumai Line, đón xe bus thành phố (市バス) chuyến số 11 đến thẳng trạm \"Unten Menkyo Shikenjo\" (運転免許試験場).",
            mapQuery: "平針運転免許試験場",
          },
        },
        {
          id: "shizuoka",
          name: "Tỉnh SHIZUOKA (静岡県)",
          nameJp: "静岡県",
          reason: "Vùng Shizuoka có nhiều khu công nghiệp và người Việt sinh sống.",
          reasonJp: "静岡エリアは工业区が多く、ベトナム人コミュニティーが多いです。",
          center: {
            name: "Trung tâm sát hạch Chubu (中部運転免許センター)",
            address: "〒420-0068 静岡県静岡市葵区田町5丁目4-1",
            howToGo: "Từ Ga Shizuoka (静岡駅), bắt xe bus Shizutetsu Justline (tuyến Seibu Chubu Line) đi khoảng 15 phút và xuống tại trạm \"Menkyo Center-mae\".",
            mapQuery: "中部運転免許センター 静岡",
          },
        },
        {
          id: "mie",
          name: "Tỉnh MIE (三重県)",
          nameJp: "三重県",
          reason: "Vùng Mie gần Nagoya, thuận tiện cho người ở khu vực Tokai.",
          reasonJp: "名古屋に近い三重エリアで、東海地方の方に便利です。",
          center: {
            name: "Trung tâm sát hạch lái xe tỉnh Mie (三重県運転免許センター)",
            address: "〒514-0821 三重県津市大字垂水2570",
            howToGo: "Từ Ga Tsu (津駅) đi ra cửa Đông, đón xe bus Mie Kotsu tại bến số 2 (hướng \"運転免許センター\") và xuống trạm cuối, mất khoảng 20 phút.",
            mapQuery: "三重県運転免許センター",
          },
        },
      ],
    },
    {
      id: "kanto",
      name: "2. Vùng KANTO MỞ RỘNG",
      nameJp: "2. 関東エリア",
      provinces: [
        {
          id: "tokyo",
          name: "Tỉnh TOKYO (東京都)",
          nameJp: "東京都",
          reason: "Thủ đô với nhiều trung tâm sát hạch, rất thuận tiện.",
          reasonJp: "首都，并有多个考试中心，非常方便。",
          center: {
            name: "Trung tâm sát hạch Samezu (鮫洲運転免許試験場)",
            address: "〒140-0011 東京都品川区東大井1丁目12-5",
            howToGo: "Xuống tại Ga Samezu (tuyến Keikyu Line) rồi đi bộ khoảng 8 phút. Hoặc từ Ga Oimachi, đón xe bus thành phố số 品91.",
            mapQuery: "鮫洲運転免許試験場",
          },
          additionalCenters: [
            {
              name: "Trung tâm sát hạch Fuchu (府中運転免許試験場)",
              address: "〒183-0002 東京都府中市多磨町3丁目1-1",
              howToGo: "Từ Ga Musashi-Koganei (tuyến JR Chuo Line) đi ra Cửa Nam, đón xe bus Keio số 武56 hoặc 武91 và xuống tại trạm 'Shikenjo-mae'.",
              mapQuery: "府中運転免許試験場",
            },
          ],
        },
        {
          id: "gunma",
          name: "Tỉnh GUNMA (群馬県)",
          nameJp: "群馬県",
          reason: "Nơi tập trung rất nhiều thực tập sinh và lao động Tokutei ngành sản xuất.",
          reasonJp: "製造業特定技能実習生や労働者が多く集まる地域です。",
          center: {
            name: "Tổng cục sát hạch lái xe Gunma (群馬県運転免許センター)",
            address: "〒371-0854 群馬県前橋市大渡町1丁目1-1",
            howToGo: "Từ Ga Shin-Maebashi (新前橋駅) tuyến JR, đón xe bus hướng đi Gunma Sougou Shikenjo mất khoảng 10 phút.",
            mapQuery: "群馬県運転免許センター",
          },
        },
        {
          id: "ibaraki",
          name: "Tỉnh IBARAKI (茨城県)",
          nameJp: "茨城県",
          reason: "Vùng đất nông nghiệp và công nghiệp có lượng người Việt cực khủng.",
          reasonJp: "農業と工業のエリアで、ベトナム人コミュニティーが非常に多いです。",
          center: {
            name: "Trung tâm sát hạch lái xe Ibaraki (茨城県運転免許センター)",
            address: "〒311-3116 茨城県東茨城县郡城里町大字長岡3783-3",
            howToGo: "Từ cửa Nam của Ga Mito (水戸駅), đón xe bus Kanto Tetsudo (tuyến đi Menkyo Center) chạy mất khoảng 30 phút là đến nơi.",
            mapQuery: "茨城県運転免許センター",
          },
        },
        {
          id: "saitama",
          name: "Tỉnh SAITAMA (埼玉県)",
          nameJp: "埼玉県",
          reason: "Vùng lân cận Tokyo với nhiều người Việt sinh sống và làm việc.",
          reasonJp: "東京に近いエリアで、多くのベトナム人が暮らしています。",
          center: {
            name: "Trung tâm sát hạch Konosu (埼玉県運転免許センター)",
            address: "〒365-0032 埼玉県鴻巣市東4丁目4-1",
            howToGo: "Xuống tại Ga Konosu (tuyến JR Takasaki Line) đi ra Cửa Đông, đón xe bus Tobu Bus tại quầy số 1, di chuyển khoảng 10 phút là tới thẳng trung tâm.",
            mapQuery: "埼玉県運転免許センター",
          },
        },
        {
          id: "kanagawa",
          name: "Tỉnh KANAGAWA (神奈川県)",
          nameJp: "神奈川県",
          reason: "Vùng Yokohama/Kawasaki với cộng đồng người Việt rất lớn.",
          reasonJp: "横浜・川崎エリアでベトナム人コミュニティーが大きいです。",
          center: {
            name: "Trung tâm sát hạch Futamatagawa (神奈川県運転免許センター)",
            address: "〒241-0815 神奈川県横浜市旭区中尾1丁目1-1",
            howToGo: "Xuống tại Ga Futamatagawa (tuyến Sotetsu Line). Đi bộ từ cửa Bắc khoảng 15 phút, hoặc bắt xe bus ngay từ bến số 1 mất khoảng 5 phút.",
            mapQuery: "神奈川県運転免許センター 二俣川",
          },
        },
        {
          id: "chiba",
          name: "Tỉnh CHIBA (千葉県)",
          nameJp: "千葉県",
          reason: "Vùng ven Tokyo với nhiều khu công nghiệp và cảng biển.",
          reasonJp: "東京に近く、工業地帯と港があるエリアです。",
          center: {
            name: "Trung tâm sát hạch Makuhari (千葉運転免許センター)",
            address: "〒261-0025 千葉県千葉市美浜区浜田1丁目1",
            howToGo: "Xuống tại Ga Kaihin-Makuhari (tuyến JR Keiyo Line). Đi bộ khoảng 15 phút hoặc bắt xe bus hãng Keisei đi tầm 5 phút.",
            mapQuery: "千葉運転免許センター",
          },
        },
      ],
    },
    {
      id: "kansai",
      name: "3. Vùng KANSAI / KYUSHU",
      nameJp: "3. 関西・九州エリア",
      provinces: [
        {
          id: "hyogo",
          name: "Tỉnh HYOGO (兵庫県)",
          nameJp: "兵庫県",
          reason: "Phủ sóng cho các bạn ở khu vực Kobe, Himeji.",
          reasonJp: "神戸・姬路エリアの方向けにカバーしています。",
          center: {
            name: "Trung tâm sát hạch Akashi (明石運転免許試験場)",
            address: "〒673-0044 兵庫県明石市荷山町1649-2",
            howToGo: "Từ Ga Akashi (明石駅), ra quầy bus số 7 phía Cửa Nam, bắt xe bus Shinki Bus đi khoảng 10 phút và xuống tại trạm \"Menkyo Shikenjo-mae\".",
            mapQuery: "明石運転免許試験場",
          },
        },
        {
          id: "osaka",
          name: "Tỉnh OSAKA (大阪府)",
          nameJp: "大阪府",
          reason: "Trung tâm vùng Osaka/Kobe với cộng đồng người Việt đông đúc.",
          reasonJp: "大阪・神戸エリアの中心で、多くのベトナム人が暮らしています。",
          center: {
            name: "Trung tâm sát hạch Kadoma (門真運転免許試験場)",
            address: "〒571-8555 大阪府門真市一番町23-16",
            howToGo: "Từ Ga Kadomashi (tuyến Keihan Main Line hoặc Osaka Monorail), bắt xe bus hãng Keihan Bus đi khoảng 10 phút.",
            mapQuery: "門真運転免許試験場",
          },
        },
        {
          id: "fukuoka",
          name: "Tỉnh FUKUOKA (福岡県)",
          nameJp: "福岡県",
          reason: "Trung tâm của vùng Kyushu, lượng du học sinh và người Việt sinh sống cực kỳ đông đảo.",
          reasonJp: "九州地方のセンターで、留学生やベトナム人コミュニティーが非常に多いです。",
          center: {
            name: "Trung tâm sát hạch lái xe Fukuoka (福岡運転免許試験場)",
            address: "〒811-1356 福岡県福岡市南区花畑4丁目7-1",
            howToGo: "Từ Ga Ohashi (大橋駅), bắt xe bus Nishitetsu tuyến số 700 hoặc từ Ga Tenjin (天神駅) bắt xe bus tuyến số 151 đến trạm \"Menkyo Shikenjo-mae\".",
            mapQuery: "福岡運転免許試験場",
          },
        },
      ],
    },
  ],
  jp: [
    {
      id: "tokai",
      name: "1. 東海地方",
      nameJp: "1. 東海地方",
      provinces: [
        {
          id: "aichi",
          name: "愛知県",
          nameJp: "愛知県",
          reason: "愛知県（名古屋）は日本にいるベトナム人コミュニティーが最も多く住む地域のひとつです。",
          reasonJp: "愛知県（名古屋）は日本にいるベトナム人コミュニティーが最も多く住む地域のひとつです。",
          center: {
            name: "平針運転免許試験場",
            address: "〒468-8513 愛知県名古屋市天白区平針南3丁目605",
            howToGo: "地下鉄鶴舞線「平針駅」から市バス系統11番に乗車し、「運転免許試験場」停留所で下车。",
            mapQuery: "平針運転免許試験場",
          },
        },
        {
          id: "shizuoka",
          name: "静岡県",
          nameJp: "静岡県",
          reason: "静岡エリアは工业区が多く、ベトナム人コミュニティーが多いです。",
          reasonJp: "静岡エリアは工业区が多く、ベトナム人コミュニティーが多いです。",
          center: {
            name: "中部運転免許センター",
            address: "〒420-0068 静岡県静岡市葵区田町5丁目4-1",
            howToGo: "静岡駅前からしずてつスタッフライン（西部中部線）に乗車し、約15分。「免許センター前」停留所で下车。",
            mapQuery: "中部運転免許センター 静岡",
          },
        },
        {
          id: "mie",
          name: "三重県",
          nameJp: "三重県",
          reason: "名古屋に近い三重エリアで、東海地方の方に便利です。",
          reasonJp: "名古屋に近い三重エリアで、東海地方の方に便利です。",
          center: {
            name: "三重県運転免許センター",
            address: "〒514-0821 三重県津市大字垂水2570",
            howToGo: "JR紀勢線「津駅」東口から三重交通バス2番のりば（免許センター行）に乗車し、終点で下车（約20分）。",
            mapQuery: "三重県運転免許センター",
          },
        },
      ],
    },
    {
      id: "kanto",
      name: "2. 関東エリア",
      nameJp: "2. 関東エリア",
      provinces: [
        {
          id: "tokyo",
          name: "東京都",
          nameJp: "東京都",
          reason: "首都，并有多个考试中心，非常方便。",
          reasonJp: "首都，并有多个考试中心，非常方便。",
          center: {
            name: "鮫洲運転免許試験場",
            address: "〒140-0011 東京都品川区東大井1丁目12-5",
            howToGo: "京急線「鮫洲駅」で下车、徒步約8分。または「大井町駅」から品91系統のバスに乗車。",
            mapQuery: "鮫洲運転免許試験場",
          },
          additionalCenters: [
            {
              name: "府中運転免許試験場",
              address: "〒183-0002 東京都府中市多磨町3丁目1-1",
              howToGo: "JR中央線「武蔵小金井駅」南口から京王バス系統武56または武91に乗車し、「試験場前」停留所で下车。",
              mapQuery: "府中運転免許試験場",
            },
          ],
        },
        {
          id: "gunma",
          name: "群馬県",
          nameJp: "群馬県",
          reason: "製造業特定技能実習生や労働者が多く集まる地域です。",
          reasonJp: "製造業特定技能実習生や労働者が多く集まる地域です。",
          center: {
            name: "群馬県運転免許センター",
            address: "〒371-0854 群馬県前橋市大渡町1丁目1-1",
            howToGo: "JR「新前橋駅」からバス（群馬総合試験場行）に乗車し、約10分。",
            mapQuery: "群馬県運転免許センター",
          },
        },
        {
          id: "ibaraki",
          name: "茨城県",
          nameJp: "茨城県",
          reason: "農業と工業のエリアで、ベトナム人コミュニティーが非常に多いです。",
          reasonJp: "農業と工業のエリアで、ベトナム人コミュニティーが非常に多いです。",
          center: {
            name: "茨城県運転免許センター",
            address: "〒311-3116 茨城県東茨城县城里町大字長岡3783-3",
            howToGo: "水戸駅南口から関東鉄道バス（免許センター行）に乗車し、約30分。",
            mapQuery: "茨城県運転免許センター",
          },
        },
        {
          id: "saitama",
          name: "埼玉県",
          nameJp: "埼玉県",
          reason: "東京に近いエリアで、多くのベトナム人が暮らしています。",
          reasonJp: "東京に近いエリアで、多くのベトナム人が暮らしています。",
          center: {
            name: "埼玉県運転免許センター",
            address: "〒365-0032 埼玉県鴻巣市東4丁目4-1",
            howToGo: "JR高崎線「鴻巣駅」東口から東武バス1番乗り場から乗車し、約10分。",
            mapQuery: "埼玉県運転免許センター",
          },
        },
        {
          id: "kanagawa",
          name: "神奈川県",
          nameJp: "神奈川県",
          reason: "横浜・川崎エリアでベトナム人コミュニティーが大きいです。",
          reasonJp: "横浜・川崎エリアでベトナム人コミュニティーが大きいです。",
          center: {
            name: "神奈川県運転免許センター 二俣川",
            address: "〒241-0815 神奈川県横浜市旭区中尾1丁目1-1",
            howToGo: "相鉄線「二俣川駅」。北口から徒歩約15分、または1番バス乗り場から乗車約5分。",
            mapQuery: "神奈川県運転免許センター 二俣川",
          },
        },
        {
          id: "chiba",
          name: "千葉県",
          nameJp: "千葉県",
          reason: "東京に近く、工業地帯と港があるエリアです。",
          reasonJp: "東京に近く、工業地帯と港があるエリアです。",
          center: {
            name: "千葉運転免許センター",
            address: "〒261-0025 千葉県千葉市美浜区浜田1丁目1",
            howToGo: "JR京葉線「海浜幕張駅」から徒歩約15分、または京成バスで約5分。",
            mapQuery: "千葉運転免許センター",
          },
        },
      ],
    },
    {
      id: "kansai",
      name: "3. 関西・九州エリア",
      nameJp: "3. 関西・九州エリア",
      provinces: [
        {
          id: "hyogo",
          name: "兵庫県",
          nameJp: "兵庫県",
          reason: "神戸・姬路エリアの方向けにカバーしています。",
          reasonJp: "神戸・姬路エリアの方向けにカバーしています。",
          center: {
            name: "明石運転免許試験場",
            address: "〒673-0044 兵庫県明石市荷山町1649-2",
            howToGo: "明石駅南口7番バス乗り場から神姫バスに乗車し、約10分。「免許試験場前」停留所で下车。",
            mapQuery: "明石運転免許試験場",
          },
        },
        {
          id: "osaka",
          name: "大阪府",
          nameJp: "大阪府",
          reason: "大阪・神戸エリアの中心で、多くのベトナム人が暮らしています。",
          reasonJp: "大阪・神戸エリアの中心で、多くのベトナム人が暮らしています。",
          center: {
            name: "門真運転免許試験場",
            address: "〒571-8555 大阪府門真市一番町23-16",
            howToGo: "京阪本線または大阪モノレール「門真市駅」から京阪バスに乗車し、約10分。",
            mapQuery: "門真運転免許試験場",
          },
        },
        {
          id: "fukuoka",
          name: "福岡県",
          nameJp: "福岡県",
          reason: "九州地方のセンターで、留学生やベトナム人コミュニティーが非常に多いです。",
          reasonJp: "九州地方のセンターで、留学生やベトナム人コミュニティーが非常に多いです。",
          center: {
            name: "福岡運転免許試験場",
            address: "〒811-1356 福岡県福岡市南区花畑4丁目7-1",
            howToGo: "大橋駅前から西鉄バス系統700番に乗車、または天神駅前から系統151番に乗車し、「免許試験場前」停留所で下车。",
            mapQuery: "福岡運転免許試験場",
          },
        },
      ],
    },
  ],
};
