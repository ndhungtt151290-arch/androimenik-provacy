import type { Lang } from "../types";

interface ProcedureSection {
  heading: string;
  content: string;
}

interface ProcedureContent {
  title: string;
  intro: string;
  sections: ProcedureSection[];
}

export const procedure: Record<Lang, ProcedureContent> = {
  vi: {
    title: "Thủ tục thi",
    intro: "HƯỚNG DẪN THỦ TỤC THI BẰNG GENTSUKI (50CC) TỪ A-Z\nThi bằng lái xe máy 50cc (Gentsuki) là cách nhanh nhất và tiết kiệm nhất để bạn chủ động đi lại, đi làm tại Nhật. Để không bị từ chối hồ sơ hoặc bỡ ngỡ tại trung tâm sát hạch, hãy chuẩn bị thật kỹ theo hướng dẫn dưới đây!",
    sections: [
      {
        heading: "BƯỚC 1: CHUẨN BỊ HỒ SƠ (THIẾT YẾU)",
        content: "Bạn cần mang đầy đủ các giấy tờ sau đến Trung tâm sát hạch lái xe:\n\nThẻ ngoại kiều (Zairyu Card): Bản gốc, còn hạn sử dụng và đã đăng ký địa chỉ cư trú hiện tại.\n\nGiấy cư trú (Juminhyo): Xin tại quận/thành phố (Shiyakusho/Kuyakusho) nơi bạn ở trong vòng 3 tháng gần nhất.\n\nLưu ý quan trọng: Phải là bản có ghi quốc tịch và KHÔNG hiển thị số My Number.\n\nẢnh thẻ (2 tấm): Kích thước chuẩn 3 x 2.4 cm (chụp trong vòng 6 tháng, nền trơn, nhìn thẳng, không đội mũ). Bạn có thể chụp tại các bốt máy tự động ngay ở ga tàu hoặc tại trung tâm thi.\n\nHộ chiếu (Passport): Mang bản gốc đi để đối chiếu phòng khi trung tâm yêu cầu kiểm tra lịch sử nhập cảnh.\n\nBút bi đen và con dấu (Inkan): Nên mang theo để điền tờ khai (một số nơi chấp nhận ký tên, nhưng mang dấu đi sẽ chủ động hơn).",
      },
      {
        heading: "BƯỚC 2: CHUẨN BỊ CHI PHÍ (LỆ PHÍ THI)",
        content: "Tổng chi phí dao động khoảng 8,000 Yên (chuẩn bị tiền mặt, các trung tâm thường không nhận quẹt thẻ):\n\nPhí dự thi lý thuyết: ~1,500 Yên / lần thi.\n\nPhí học lái xe thực tế (Gentsuki Koshu): ~4,500 Yên (bắt buộc học sau khi đỗ lý thuyết để được cấp bằng).\n\nPhí cấp thẻ bằng lái: ~2,100 Yên.",
      },
      {
        heading: "BƯỚC 3: QUY TRÌNH TRONG NGÀY THI (LỘ TRÌNH 1 NGÀY)",
        content: "Kỳ thi Gentsuki diễn ra và cấp bằng ngay trong ngày. Bạn cần đến trung tâm từ sớm (thường là 8:30 - 9:00 sáng tùy tỉnh).\n\nNộp hồ sơ & Mua tem lệ phí: Điền đơn đăng ký, dán ảnh thẻ và mua tem dán vào hồ sơ tại quầy.\n\nKiểm tra thị lực (Kiểm tra mắt): Kiểm tra độ cận (bằng mắt thường hoặc kính) và khả năng phân biệt 3 màu đèn giao thông: Xanh, Đỏ, Vàng. (Nếu bạn bị cận, bắt buộc phải đeo kính khi kiểm tra và khi lái xe).\n\nLàm bài thi lý thuyết:\n- Thời gian làm bài: 30 phút.\n- Số lượng câu hỏi: 48 câu (46 câu chữ 1 điểm, 2 câu tình huống hình ảnh 2 điểm).\n- Điều kiện đỗ: Đạt tối thiểu 45 / 50 điểm.\n\nMẹo hay: Hầu hết các tỉnh tại Nhật hiện nay đã hỗ trợ Đề thi bằng Tiếng Việt. Lúc nộp hồ sơ, hãy chủ động nói với nhân viên: \"ベトナム語の試験をお願いします\" (Cho tôi đăng ký đề tiếng Việt).\n\nHọc lái xe thực tế (Gentsuki Koshu): Sau khi có kết quả đỗ lý thuyết vào cuối buổi sáng, bạn sẽ tham gia buổi hướng dẫn lái xe an toàn ngoài bãi khoảng 3 tiếng vào buổi chiều.\n\nNhận bằng lái: Chụp ảnh tại trung tâm và nhận thẻ bằng lái ngay trong ngày!",
      },
    ],
  },
  jp: {
    title: "試験手続き",
    intro: "原動機付自転車（50cc）免許取得手続き 完全ガイド\n原付（50cc）の運転免許を取得することは、日本での移動手段を自分のペースで確保するための最も早くて経済的な方法です。書類不備で受付を断わられることのないよう、また試験場で戸惑わないよう、以下の準備をしっかり行ってください！",
    sections: [
      {
        heading: "ステップ1：必要書類の準備",
        content: "驾校（運転免許試験場）に以下の書類を持参してください：\n\n在留カード（Zairyu Card）：有効期限内のもので、現在の両住所が登録されているもの。\n\n住民票（Juminhyo）：お住まいの市区町村役場で過去3ヶ月以内に発行されたものを取得。\n\n重要なお知らせ：国籍が記載されており、マイナンバー（非表示）の住民票を取得してください。\n\n証明写真（2枚）：サイズ3 x 2.4 cm（6ヶ月以内に撮影、平坦な背景、前を向いている帽子を被っていない状態）。駅の証明写真機または試験場で撮影可能です。\n\nパスポート（Passport）：原本をお持ちください。試験場が入国履歴の確認を求める場合があります。\n\nボールペンと印章（インカン）：申請書類への記入に使用します（署名でも可の会場もありますが、印章を持参すればより確実です）。",
      },
      {
        heading: "ステップ2：費用の準備",
        content: "総費用はersion8,000円程度（現金をご用意ください、多くの試験場ではカード払いができません）：\n\n学科試験手数料：~1,500円 / 1回の試験\n\n原付教的（実技教習）：~4,500円（学科試験合格後に必須）\n\n運転免許証交付手数料：~2,100円",
      },
      {
        heading: "ステップ3：試験日流程（1日コース）",
        content: "原付試験はその日のうちに試験を受けて免許交付まで行われます。早めに試験場にお越しください（通常是8:30 - 9:00）。\n\n書類提出＆手数料シールの購入：申請書に記入し、証明写真を貼り、手続き窓口で手数料用の切手を貼り付けます。\n\n視力検査：近視のチェック（裸眼またはコラー使用）と信号の色（青・赤・黄）の識別能力をチェック。（近視の方は検査時と運転時にコラーの着用が義務付けられます）\n\n学科試験：\n- 試験時間：30分\n- 問題数：48問（46問が1点、2問がイラスト情形問題が2点）\n- 合格基準：50点満点中45点以上\n\n痘жет tuyệt vời：ほとんどの都道府県では越南語版の試験が受けられます。書類提出時にスタッフに：「ベトナム語の試験をお願いします」とお伝えください。\n\n実技教習（原付教的）：学科試験に合格した後、午前中の終わり頃に結果を받아、午後に約3時間の実地安全運転指導に参加します。\n\n免許交付：試験場で写真を撮り、その日に運転免許証を受け取り完了です！",
      },
    ],
  },
};
