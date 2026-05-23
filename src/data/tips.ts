import type { Lang } from "../types";

interface TipSection {
  heading: string;
  content: string;
}

interface TipsContent {
  title: string;
  intro: string;
  sections: TipSection[];
}

export const tips: Record<Lang, TipsContent> = {
  vi: {
    title: "Mẹo ghi nhớ",
    intro: "MẸO GHI NHỚ: THẦN CHÚ \"BỎ TÚI\" THI LÀ ĐỖ!\nKhi đi thi lý thuyết lái xe xe máy 50cc (Gentsuki) tại Nhật, các câu hỏi rất dễ gây nhầm lẫn nếu bạn chỉ học vẹt. Hãy thuộc lòng những câu \"thần chú\" cực dễ nhớ dưới đây để tự tin hốt điểm tuyệt đối nhé!",
    sections: [
      {
        heading: "1. Thần chú về \"Các Con Số Vàng\"",
        content: "Tốc độ giới hạn tối đa:\n\"Gentsuki tối đa ba mươi (30 km/h),\nPhóng lên bốn chục (40 km/h) mất tiền như chơi!\"\n(Luôn chọn SAI nếu câu hỏi bảo xe Gentsuki được chạy tối đa 40km/h hoặc 50km/h dù đường đó vắng).\n\nNồng độ cồn:\n\"Không phẩy mười lăm (0.15 mg) là ngưỡng treo bằng,\nUống một ngụm nhỏ cũng thành trắng tay!\"",
      },
      {
        heading: "2. Thần chú phân biệt \"Vạch Kẻ Đường\"",
        content: "Vạch màu trắng đứt đoạn:\n\"Trắng đứt như dải lụa mềm,\nĐè qua thoải mái, vượt lên nhẹ nhàng.\"\n\nVạch màu vàng nét liền:\n\"Vàng tươi là vạch 'cấm đè',\nLấn sang một tấc, cảnh sát huýt còi!\"",
      },
      {
        heading: "3. Quy tắc ưu tiên tại Ngã Tư không đèn tín hiệu",
        content: "Khi hai xe cùng đến ngã tư đường có kích cỡ như nhau, áp dụng quy tắc xe đi bên trái (vì Nhật Bản lái xe bên trái):\n\"Đường to đi trước, đường nhỏ đi sau,\nNếu cùng kích cỡ, bên trái ưu tiên nhau.\"",
      },
      {
        heading: "4. Bí kíp nhận diện \"Bẫy tuyệt đối\" (Cực Kỳ Quan Trọng!)",
        content: "Trong đề thi của Nhật rất hay có những câu mang tính khẳng định tuyệt đối để lừa người thi.\n\nDấu hiệu bẫy: Khi trong câu hỏi xuất hiện các từ: \"Luôn luôn\" (Kanarazu - 必ず), \"Tuyệt đối\" (Zettai - 絶対), \"Bất kỳ lúc nào\" (Ikanaaru baai mo - いかなる場合も)...\n\nMẹo xử lý: \"Thấy chữ 'luôn luôn', 'tuyệt đối' liền tay,\nDừng lại ba giây, 90% đáp án là SAI (False)!\"\n(Ví dụ: \"Khi thấy xe cứu thương, bất kỳ lúc nào cũng phải tắp vào lề TRÁI\" -> SAI, vì nếu tắp vào lề trái gây cản trở xe cứu thương thì phải tắp sang lề PHẢI hoặc đi tiếp qua ngã tư rồi mới dừng).",
      },
      {
        heading: "5. Khoảng cách an toàn với Người Đi Bộ",
        content: "Khi đi qua người đi bộ (hoặc xe đạp), nếu có khoảng cách an toàn (trên 1.5 mét) thì có thể đi bình thường. Nếu không có không gian rộng, bắt buộc phải đi chậm (Joko - 徐行).\n\n\"Gặp người đi bộ trên đường,\nRộng rãi thì lách, hẹp đường ĐI CHẬM ngay!\"",
      },
      {
        heading: "6. Phân biệt \"Biển Báo\" và \"Vạch Kẻ Đường\" (道路標識 vs 道路標示)",
        content: "Biển báo giao thông (道路標識 - Dōro Hyōshiki):\n• Nhận diện: Các tấm biển được dựng trên cột, treo trên cao hoặc gắn ở mép đường.\n• Đặc điểm: Thường có hình tròn (cấm/bắt buộc), hình thoi (cảnh báo) hoặc hình vuông/chữ nhật (chỉ dẫn).\n• Hiệu lực: Có tác dụng từ vị trí đặt biển trở đi.\n\nVạch kẻ đường (道路標示 - Dōro Hyōji):\n• Nhận diện: Các hình vẽ, chữ viết, hoặc đường kẻ được sơn trực tiếp trên mặt đường.\n• Đặc điểm: Bao gồm cả chữ (ví dụ: \"バス専用\"), hình vẽ (mũi tên, hình thoi) hay các vạch kẻ phân làn.\n• Hiệu lực: Có tác dụng ngay tại vị trí vạch sơn trên mặt đường.\n\n\"Biển báo treo cột, Vạch kẻ nằm dưới đất!\"",
      },
    ],
  },
  jp: {
    title: "記憶のコツ",
    intro: "記憶のコツ：試験に合格する「究極の裏技」！\n原動機付自転車（的原50cc）の学科試験を受ける際、ただ暗記だけでは混乱しやすい問題が多く出てきます。以下の「究極の裏技」を覚えて、自信を持って満点を目指しましょう！",
    sections: [
      {
        heading: "1. 「黄金数字」の裏技",
        content: "最高速度制限：\n「原付の最高速度は時速30キロ、\n40キロに飛ばすと罰金確定！」\n（問題で原付が40km/hまたは50km/hで走れると言っている場合は、道を空いていても常に「×」を選びましょう）\n\n酒気帯び濃度：\n「0.15 mgが免停のボーダーライン、\n一口飲んだだけでもアウト！」",
      },
      {
        heading: "2. 「道路標示」を見分ける裏技",
        content: "白い破線：\n「白の破線は柔らかい絹のように、\n踏まないければ追い越しも自由！」\n\n黄色の実線：\n「黄色は『踏むな』の標示、\n少しでも越えたら警察が笛を吹く！」",
      },
      {
        heading: "3. 信号のない交差点での優先ルール",
        content: "同じサイズの道路同士が同時に交差点に差し掛かった場合、左側の車が優先（日本人は左側通行なので）：\n「広い方が先に通り、狭い方が後に待つ、\nサイズが同じなら、左側優先！」",
      },
      {
        heading: "4. 「絶対トラップ」を見破るコツ（超重要！）",
        content: "日本の試験では、絶対的な断定表現を使って受験者を騙す問題が 자주 出題されます。\n\nトラップのサイン：問題文に「必ず」「絶対」「いかなる場合も」といった言葉が出たとき...\n\n対処のコツ：「『必ず』『絶対』を見たら要注意！\n3秒止めて、90%は「×」が正解！」\n（例：「救急車を見たら、いかなる場合も左側に寄り避けて停止」→「×」、左側への待避が救急車のじゃまになる場合は右側に寄るか、交差点を通過してから停止する必要があります）",
      },
      {
        heading: "5. 歩行者との安全距離",
        content: "歩行者（または自転車）を通行する際、安全な間隔（1.5メートル以上）があれば通常通り通行できます。スペースがなければ、徐行（徐行）が義務付けられます。\n\n「歩行者に会ったら、\nスペースがあればスムーズに通過、\n狭い道は『徐行』바로 적용！」",
      },
      {
        heading: "6. 「道路標識」と「道路標示」の見分け方",
        content: "道路標識（Dōro Hyōshiki）：\n• 識別方法：柱に立っている、板が吊り下げられている、または道路の端に取り付けられている標識。\n• 特徴：通常是円形（禁止・命令）、ひし形（警告）、四角形・長方形（案内）。\n• 効力：標識の設置位置から適用される。\n\n道路標示（Dōro Hyōji）：\n• 識別方法：道路上直接に描かれたすべての絵、文字、または線。\n• 特徴：文字（例：「バス専用」）、絵（矢印、ひし形）、レーンを分ける線を含む。\n• 効力：道路上直接描かれた位置に適用される。\n\n「標識は柱に立つ、標示は地面に描く！」",
      },
    ],
  },
};
