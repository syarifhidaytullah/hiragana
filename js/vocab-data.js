/* =========================================================
 * vocab-data.js — KanaLearn N5 Vocabulary Practice Dataset
 * Fokus: Membiasakan membaca Hiragana & Katakana dalam kosakata nyata (tanpa kanji).
 * Untuk materi Kanji diarahkan ke Modul Starter Kit Kanji N5 di Lynk.id.
 * ========================================================= */
(function (root) {
  "use strict";

  const VOCAB = [
    /* =========================================================
     * 1. HIRAGANA — Salam & Ungkapan (Aisatsu)
     * ========================================================= */
    { id: "v-h-01", kana: "おはよう", romaji: "ohayou", meaning: "Selamat pagi (santai)", script: "hiragana", category: "salam", tip: "Digunakan sesama teman/keluarga di pagi hari." },
    { id: "v-h-02", kana: "こんにちは", romaji: "konnichiwa", meaning: "Halo / Selamat siang", script: "hiragana", category: "salam", tip: "Perhatikan: huruf terakhir は dibaca 'wa' sebagai partikel salam." },
    { id: "v-h-03", kana: "こんばんは", romaji: "konbanwa", meaning: "Selamat malam", script: "hiragana", category: "salam", tip: "Sama seperti konnichiwa, huruf は di akhir dibaca 'wa'." },
    { id: "v-h-04", kana: "ありがとう", romaji: "arigatou", meaning: "Terima kasih", script: "hiragana", category: "salam", tip: "Huruf う di akhir memperpanjang vokal 'o' (arigatō)." },
    { id: "v-h-05", kana: "すみません", romaji: "sumimasen", meaning: "Permisi / Maaf", script: "hiragana", category: "salam", tip: "Kata serbaguna: bisa untuk panggil pelayan, minta maaf, atau terima kasih." },
    { id: "v-h-06", kana: "さようなら", romaji: "sayounara", meaning: "Selamat tinggal", script: "hiragana", category: "salam", tip: "Huruf う memperpanjang vokal 'yo' (sayōnara)." },
    { id: "v-h-07", kana: "はい", romaji: "hai", meaning: "Ya / Hadir", script: "hiragana", category: "salam", tip: "Jawaban setuju atau tanda menyimak pembicaraan." },
    { id: "v-h-08", kana: "いいえ", romaji: "iie", meaning: "Tidak / Bukan", script: "hiragana", category: "salam", tip: "Vokal ganda 'ii' dibaca panjang 2 ketukan." },
    { id: "v-h-09", kana: "どうぞ", romaji: "douzo", meaning: "Silakan", script: "hiragana", category: "salam", tip: "Huruf ど (do) menggunakan dakuten tenten." },
    { id: "v-h-10", kana: "ごめんなさい", romaji: "gomennasai", meaning: "Mohon maaf", script: "hiragana", category: "salam", tip: "Permintaan maaf personal kepada orang yang sudah akrab." },
    { id: "v-h-11", kana: "じゃあね", romaji: "jaane", meaning: "Sampai jumpa nanti", script: "hiragana", category: "salam", tip: "Menggunakan kombinasi yōon じゃ (ja) dengan vokal panjang." },
    { id: "v-h-12", kana: "おねがいします", romaji: "onegaishimasu", meaning: "Tolong / Mohon bantuannya", script: "hiragana", category: "salam", tip: "Frasa sopan yang sangat sering dipakai di Jepang sehari-hari." },

    /* =========================================================
     * 2. HIRAGANA — Benda & Lingkungan Sekitar
     * ========================================================= */
    { id: "v-h-13", kana: "ほん", romaji: "hon", meaning: "Buku", script: "hiragana", category: "benda", tip: "Berakhiran ん (n)." },
    { id: "v-h-14", kana: "くるま", romaji: "kuruma", meaning: "Mobil", script: "hiragana", category: "benda", tip: "3 ketukan seion murni: ku-ru-ma." },
    { id: "v-h-15", kana: "いえ", romaji: "ie", meaning: "Rumah", script: "hiragana", category: "benda", tip: "Dibaca i-e." },
    { id: "v-h-16", kana: "みず", romaji: "mizu", meaning: "Air (putih/minum)", script: "hiragana", category: "benda", tip: "Huruf ず (zu) baris za-ji-zu-ze-zo." },
    { id: "v-h-17", kana: "おちゃ", romaji: "ocha", meaning: "Teh hijau Jepang", script: "hiragana", category: "benda", tip: "Kombinasi yōon ちゃ (cha)." },
    { id: "v-h-18", kana: "さかな", romaji: "sakana", meaning: "Ikan", script: "hiragana", category: "benda", tip: "Kata dasar 3 huruf: sa-ka-na." },
    { id: "v-h-19", kana: "にく", romaji: "niku", meaning: "Daging", script: "hiragana", category: "benda", tip: "Dibaca ni-ku." },
    { id: "v-h-20", kana: "たまご", romaji: "tamago", meaning: "Telur", script: "hiragana", category: "benda", tip: "Huruf ご (go) ber-dakuten." },
    { id: "v-h-21", kana: "やさい", romaji: "yasai", meaning: "Sayuran", script: "hiragana", category: "benda", tip: "Dibaca ya-sa-i." },
    { id: "v-h-22", kana: "ねこ", romaji: "neko", meaning: "Kucing", script: "hiragana", category: "benda", tip: "Awas tertukar huruf ね (ne) dengan れ (re) atau わ (wa)." },
    { id: "v-h-23", kana: "いぬ", romaji: "inu", meaning: "Anjing", script: "hiragana", category: "benda", tip: "Huruf ぬ (nu) memiliki lingkaran ekor di ujung kanan." },
    { id: "v-h-24", kana: "ともだち", romaji: "tomodachi", meaning: "Teman / Sahabat", script: "hiragana", category: "benda", tip: "Mengandung dakuten だ (da)." },
    { id: "v-h-25", kana: "せんせい", romaji: "sensei", meaning: "Guru / Pengajar", script: "hiragana", category: "benda", tip: "Vokal い di akhir membuat e panjang (sensē)." },
    { id: "v-h-26", kana: "がくせい", romaji: "gakusei", meaning: "Murid / Pelajar", script: "hiragana", category: "benda", tip: "Huruf が (ga) ber-dakuten." },
    { id: "v-h-27", kana: "ひと", romaji: "hito", meaning: "Orang", script: "hiragana", category: "benda", tip: "Dibaca hi-to." },
    { id: "v-h-28", kana: "て", romaji: "te", meaning: "Tangan", script: "hiragana", category: "benda", tip: "Hanya satu karakter hiragana: te." },
    { id: "v-h-29", kana: "め", romaji: "me", meaning: "Mata", script: "hiragana", category: "benda", tip: "Satu karakter hiragana: me (awas tertukar ぬ)." },
    { id: "v-h-30", kana: "くち", romaji: "kuchi", meaning: "Mulut", script: "hiragana", category: "benda", tip: "Dibaca ku-chi." },
    { id: "v-h-31", kana: "あたま", romaji: "atama", meaning: "Kepala", script: "hiragana", category: "benda", tip: "Dibaca a-ta-ma." },
    { id: "v-h-32", kana: "あめ", romaji: "ame", meaning: "Hujan", script: "hiragana", category: "benda", tip: "Vokal a lalu me." },
    { id: "v-h-33", kana: "やま", romaji: "yama", meaning: "Gunung", script: "hiragana", category: "benda", tip: "Dibaca ya-ma." },
    { id: "v-h-34", kana: "かわ", romaji: "kawa", meaning: "Sungai", script: "hiragana", category: "benda", tip: "Dibaca ka-wa." },
    { id: "v-h-35", kana: "はな", romaji: "hana", meaning: "Bunga / Hidung", script: "hiragana", category: "benda", tip: "Tergantung nada intonasi konteks kalimat." },
    { id: "v-h-36", kana: "そら", romaji: "sora", meaning: "Langit", script: "hiragana", category: "benda", tip: "Dibaca so-ra." },
    { id: "v-h-37", kana: "かばん", romaji: "kaban", meaning: "Tas", script: "hiragana", category: "benda", tip: "Mengandung ば (ba) dan diakhiri ん (n)." },
    { id: "v-h-38", kana: "くつ", romaji: "kutsu", meaning: "Sepatu", script: "hiragana", category: "benda", tip: "Huruf つ (tsu) ukuran penuh (bukan sokuon kecil)." },
    { id: "v-h-39", kana: "えんぴつ", romaji: "enpitsu", meaning: "Pensil", script: "hiragana", category: "benda", tip: "Huruf ぴ (pi) ber-handakuten lingkaran maru." },
    { id: "v-h-40", kana: "かさ", romaji: "kasa", meaning: "Payung", script: "hiragana", category: "benda", tip: "Dibaca ka-sa." },
    { id: "v-h-41", kana: "おかね", romaji: "okane", meaning: "Uang", script: "hiragana", category: "benda", tip: "Huruf awalan お (o) bentuk penghormatan." },
    { id: "v-h-42", kana: "でんしゃ", romaji: "densha", meaning: "Kereta listrik", script: "hiragana", category: "benda", tip: "Mengandung kombinasi yōon しゃ (sha)." },
    { id: "v-h-43", kana: "えき", romaji: "eki", meaning: "Stasiun kereta", script: "hiragana", category: "benda", tip: "Dibaca e-ki." },
    { id: "v-h-44", kana: "まち", romaji: "machi", meaning: "Kota", script: "hiragana", category: "benda", tip: "Dibaca ma-chi." },
    { id: "v-h-45", kana: "みせ", romaji: "mise", meaning: "Toko / Kedai", script: "hiragana", category: "benda", tip: "Dibaca mi-se." },

    /* =========================================================
     * 3. HIRAGANA — Angka & Waktu
     * ========================================================= */
    { id: "v-h-46", kana: "いち", romaji: "ichi", meaning: "Satu (1)", script: "hiragana", category: "angka-waktu", tip: "Angka 1 dalam bahasa Jepang." },
    { id: "v-h-47", kana: "に", romaji: "ni", meaning: "Dua (2)", script: "hiragana", category: "angka-waktu", tip: "Angka 2 dalam bahasa Jepang." },
    { id: "v-h-48", kana: "さん", romaji: "san", meaning: "Tiga (3)", script: "hiragana", category: "angka-waktu", tip: "Angka 3 dalam bahasa Jepang." },
    { id: "v-h-49", kana: "よん", romaji: "yon", meaning: "Empat (4)", script: "hiragana", category: "angka-waktu", tip: "Juga sering dibaca し (shi)." },
    { id: "v-h-50", kana: "ご", romaji: "go", meaning: "Lima (5)", script: "hiragana", category: "angka-waktu", tip: "Angka 5 dalam bahasa Jepang." },
    { id: "v-h-51", kana: "ろく", romaji: "roku", meaning: "Enam (6)", script: "hiragana", category: "angka-waktu", tip: "Angka 6 dalam bahasa Jepang." },
    { id: "v-h-52", kana: "なな", romaji: "nana", meaning: "Tujuh (7)", script: "hiragana", category: "angka-waktu", tip: "Juga sering dibaca しち (shichi)." },
    { id: "v-h-53", kana: "はち", romaji: "hachi", meaning: "Delapan (8)", script: "hiragana", category: "angka-waktu", tip: "Angka 8 dalam bahasa Jepang." },
    { id: "v-h-54", kana: "きゅう", romaji: "kyuu", meaning: "Sembilan (9)", script: "hiragana", category: "angka-waktu", tip: "Kombinasi yōon きゅ (kyu) + vokal panjang う." },
    { id: "v-h-55", kana: "じゅう", romaji: "juu", meaning: "Sepuluh (10)", script: "hiragana", category: "angka-waktu", tip: "Kombinasi yōon じゅ (ju) + vokal panjang う." },
    { id: "v-h-56", kana: "いま", romaji: "ima", meaning: "Sekarang", script: "hiragana", category: "angka-waktu", tip: "Waktu saat ini." },
    { id: "v-h-57", kana: "きょう", romaji: "kyou", meaning: "Hari ini", script: "hiragana", category: "angka-waktu", tip: "Kombinasi yōon きょ (kyo) + う (panjang)." },
    { id: "v-h-58", kana: "あした", romaji: "ashita", meaning: "Besok", script: "hiragana", category: "angka-waktu", tip: "Dibaca a-shi-ta." },
    { id: "v-h-59", kana: "きのう", romaji: "kinou", meaning: "Kemarin", script: "hiragana", category: "angka-waktu", tip: "Dibaca ki-no-u (kinō)." },
    { id: "v-h-60", kana: "あさ", romaji: "asa", meaning: "Pagi hari", script: "hiragana", category: "angka-waktu", tip: "Waktu pagi." },
    { id: "v-h-61", kana: "ひる", romaji: "hiru", meaning: "Siang hari", script: "hiragana", category: "angka-waktu", tip: "Waktu tengah hari." },
    { id: "v-h-62", kana: "よる", romaji: "yoru", meaning: "Malam hari", script: "hiragana", category: "angka-waktu", tip: "Waktu malam." },
    { id: "v-h-63", kana: "まいにち", romaji: "mainichi", meaning: "Setiap hari", script: "hiragana", category: "angka-waktu", tip: "Dibaca ma-i-ni-chi." },

    /* =========================================================
     * 4. HIRAGANA — Kata Kerja Dasar (Doushi)
     * ========================================================= */
    { id: "v-h-64", kana: "たべる", romaji: "taberu", meaning: "Makan", script: "hiragana", category: "kata-kerja", tip: "Kata kerja Golongan 2 (Ichidan)." },
    { id: "v-h-65", kana: "のむ", romaji: "nomu", meaning: "Minum", script: "hiragana", category: "kata-kerja", tip: "Kata kerja Golongan 1 (Godan)." },
    { id: "v-h-66", kana: "みる", romaji: "miru", meaning: "Melihat / Menonton", script: "hiragana", category: "kata-kerja", tip: "Kata kerja Golongan 2." },
    { id: "v-h-67", kana: "きく", romaji: "kiku", meaning: "Mendengar / Bertanya", script: "hiragana", category: "kata-kerja", tip: "Dibaca ki-ku." },
    { id: "v-h-68", kana: "いく", romaji: "iku", meaning: "Pergi", script: "hiragana", category: "kata-kerja", tip: "Dibaca i-ku." },
    { id: "v-h-69", kana: "くる", romaji: "kuru", meaning: "Datang", script: "hiragana", category: "kata-kerja", tip: "Kata kerja tidak beraturan (fukisoku)." },
    { id: "v-h-70", kana: "かえる", romaji: "kaeru", meaning: "Pulang", script: "hiragana", category: "kata-kerja", tip: "Godan verb (berakhiran eru tapi masuk Golongan 1)." },
    { id: "v-h-71", kana: "はなす", romaji: "hanasu", meaning: "Berbicara", script: "hiragana", category: "kata-kerja", tip: "Dibaca ha-na-su." },
    { id: "v-h-72", kana: "よむ", romaji: "yomu", meaning: "Membaca", script: "hiragana", category: "kata-kerja", tip: "Dibaca yo-mu." },
    { id: "v-h-73", kana: "かく", romaji: "kaku", meaning: "Menulis / Menggambar", script: "hiragana", category: "kata-kerja", tip: "Dibaca ka-ku." },
    { id: "v-h-74", kana: "ねる", romaji: "neru", meaning: "Tidur", script: "hiragana", category: "kata-kerja", tip: "Kata kerja Golongan 2." },
    { id: "v-h-75", kana: "おきる", romaji: "okiru", meaning: "Bangun tidur", script: "hiragana", category: "kata-kerja", tip: "Kata kerja Golongan 2." },
    { id: "v-h-76", kana: "かう", romaji: "kau", meaning: "Membeli", script: "hiragana", category: "kata-kerja", tip: "Dibaca ka-u." },
    { id: "v-h-77", kana: "まつ", romaji: "matsu", meaning: "Menunggu", script: "hiragana", category: "kata-kerja", tip: "Bentuk sopan: まちます (machimasu)." },
    { id: "v-h-78", kana: "あるく", romaji: "aruku", meaning: "Berjalan kaki", script: "hiragana", category: "kata-kerja", tip: "Dibaca a-ru-ku." },
    { id: "v-h-79", kana: "はしる", romaji: "hashiru", meaning: "Berlari", script: "hiragana", category: "kata-kerja", tip: "Kata kerja Golongan 1." },
    { id: "v-h-80", kana: "あう", romaji: "au", meaning: "Bertemu", script: "hiragana", category: "kata-kerja", tip: "Dibaca a-u." },
    { id: "v-h-81", kana: "つくる", romaji: "tsukuru", meaning: "Membuat / Memasak", script: "hiragana", category: "kata-kerja", tip: "Dibaca tsu-ku-ru." },
    { id: "v-h-82", kana: "あそぶ", romaji: "asobu", meaning: "Bermain / Bersenang-senang", script: "hiragana", category: "kata-kerja", tip: "Mengandung huruf ぶ (bu) ber-dakuten." },
    { id: "v-h-83", kana: "およぐ", romaji: "oyogu", meaning: "Berenang", script: "hiragana", category: "kata-kerja", tip: "Mengandung huruf ぐ (gu) ber-dakuten." },

    /* =========================================================
     * 5. HIRAGANA — Kata Sifat Dasar (Keiyoushi)
     * ========================================================= */
    { id: "v-h-84", kana: "おおきい", romaji: "ookii", meaning: "Besar", script: "hiragana", category: "kata-sifat", tip: "Vokal お ganda dibaca panjang ōkii." },
    { id: "v-h-85", kana: "ちいさい", romaji: "chiisai", meaning: "Kecil", script: "hiragana", category: "kata-sifat", tip: "Vokal い ganda dibaca panjang chīsai." },
    { id: "v-h-86", kana: "あたらしい", romaji: "atarashii", meaning: "Baru", script: "hiragana", category: "kata-sifat", tip: "Lawan kata dari ふるい (furui)." },
    { id: "v-h-87", kana: "ふるい", romaji: "furui", meaning: "Lama / Kuno / Tua (benda)", script: "hiragana", category: "kata-sifat", tip: "Hanya untuk benda, bukan untuk umur manusia." },
    { id: "v-h-88", kana: "いい", romaji: "ii", meaning: "Bagus / Baik", script: "hiragana", category: "kata-sifat", tip: "Bentuk aslinya よい (yoi)." },
    { id: "v-h-89", kana: "わるい", romaji: "warui", meaning: "Buruk / Jelek", script: "hiragana", category: "kata-sifat", tip: "Lawan kata dari いい (ii)." },
    { id: "v-h-90", kana: "たかい", romaji: "takai", meaning: "Tinggi / Mahal", script: "hiragana", category: "kata-sifat", tip: "Bisa berarti tinggi secara fisik atau harga mahal." },
    { id: "v-h-91", kana: "やすい", romaji: "yasui", meaning: "Murah", script: "hiragana", category: "kata-sifat", tip: "Lawan kata dari たかい (harga mahal)." },
    { id: "v-h-92", kana: "おいしい", romaji: "oishii", meaning: "Enak / Lezat", script: "hiragana", category: "kata-sifat", tip: "Paling sering diucapkan saat menyantap makanan." },
    { id: "v-h-93", kana: "あつい", romaji: "atsui", meaning: "Panas", script: "hiragana", category: "kata-sifat", tip: "Bisa untuk suhu cuaca maupun suhu benda/makanan." },
    { id: "v-h-94", kana: "さむい", romaji: "samui", meaning: "Dingin (suhu udara / cuaca)", script: "hiragana", category: "kata-sifat", tip: "Khusus untuk udara atau iklim dingin." },
    { id: "v-h-95", kana: "つめたい", romaji: "tsumetai", meaning: "Dingin (suhu sentuhan benda)", script: "hiragana", category: "kata-sifat", tip: "Khusus sentuhan benda, minuman dingin, dsb." },
    { id: "v-h-96", kana: "たのしい", romaji: "tanoshii", meaning: "Menyenangkan", script: "hiragana", category: "kata-sifat", tip: "Menggambarkan suasana hati senang/gembira." },
    { id: "v-h-97", kana: "むずかしい", romaji: "muzukashii", meaning: "Sulit / Sukar", script: "hiragana", category: "kata-sifat", tip: "Lawan kata dari やさしい (mudah)." },
    { id: "v-h-98", kana: "やさしい", romaji: "yasashii", meaning: "Mudah / Baik hati", script: "hiragana", category: "kata-sifat", tip: "Bisa berarti soal mudah, atau orang yang ramah." },
    { id: "v-h-99", kana: "しずか", romaji: "shizuka", meaning: "Tenang / Sunyi", script: "hiragana", category: "kata-sifat", tip: "Kata sifat-Na (shizuka na)." },
    { id: "v-h-100", kana: "げんき", romaji: "genki", meaning: "Sehat / Bersemangat", script: "hiragana", category: "kata-sifat", tip: "Sering dipakai dalam sapaan おげんきですか (Apa kabar?)." },
    { id: "v-h-101", kana: "すき", romaji: "suki", meaning: "Suka / Gemar", script: "hiragana", category: "kata-sifat", tip: "Kata sifat-Na yang menyatakan rasa suka." },
    { id: "v-h-102", kana: "きれい", romaji: "kirei", meaning: "Cantik / Bersih / Rapi", script: "hiragana", category: "kata-sifat", tip: "Meskipun berakhiran 'ei', ini adalah kata sifat-Na." },
    { id: "v-h-103", kana: "べんり", romaji: "benri", meaning: "Praktis / Bermanfaat", script: "hiragana", category: "kata-sifat", tip: "Kata sifat-Na yang sering dipakai untuk fasilitas/alat." },

    /* =========================================================
     * 6. KATAKANA — Makanan & Minuman Serapan
     * ========================================================= */
    { id: "v-k-104", kana: "パン", romaji: "pan", meaning: "Roti", script: "katakana", category: "makanan", tip: "Dari bahasa Portugis 'pão'." },
    { id: "v-k-105", kana: "コーヒー", romaji: "koohii", meaning: "Kopi", script: "katakana", category: "makanan", tip: "Tanda ー (chōonpu) memperpanjang vokal 'o' dan 'i'." },
    { id: "v-k-106", kana: "ミルク", romaji: "miruku", meaning: "Susu", script: "katakana", category: "makanan", tip: "Dari kata bahasa Inggris 'milk'." },
    { id: "v-k-107", kana: "ケーキ", romaji: "keeki", meaning: "Kue (Cake)", script: "katakana", category: "makanan", tip: "Tanda ー memperpanjang vokal 'ke'." },
    { id: "v-k-108", kana: "ジュース", romaji: "juusu", meaning: "Jus", script: "katakana", category: "makanan", tip: "Kombinasi yōon katakana ジュ (ju) + vokal panjang." },
    { id: "v-k-109", kana: "ビール", romaji: "biiru", meaning: "Bir", script: "katakana", category: "makanan", tip: "Awas jangan tertukar dengan ビル (biru = gedung bertingkat)." },
    { id: "v-k-110", kana: "アイス", romaji: "aisu", meaning: "Es / Es krim", script: "katakana", category: "makanan", tip: "Kependekan dari ice cream atau es batu." },
    { id: "v-k-111", kana: "ラーメン", romaji: "raamen", meaning: "Ramen", script: "katakana", category: "makanan", tip: "Mie kuah khas Jepang yang ditulis katakana." },
    { id: "v-k-112", kana: "チーズ", romaji: "chiizu", meaning: "Keju", script: "katakana", category: "makanan", tip: "Dari kata 'cheese', huruf ズ ber-dakuten." },
    { id: "v-k-113", kana: "カレー", romaji: "karee", meaning: "Kari Jepang", script: "katakana", category: "makanan", tip: "Dari kata 'curry'." },
    { id: "v-k-114", kana: "バナナ", romaji: "banana", meaning: "Pisang", script: "katakana", category: "makanan", tip: "Kata 3 suku kata: ba-na-na." },
    { id: "v-k-115", kana: "トマト", romaji: "tomato", meaning: "Tomat", script: "katakana", category: "makanan", tip: "Kata 3 suku kata: to-ma-to." },
    { id: "v-k-116", kana: "サラダ", romaji: "sarada", meaning: "Salad", script: "katakana", category: "makanan", tip: "Huruf terakhir ダ (da) ber-dakuten." },
    { id: "v-k-117", kana: "チョコレート", romaji: "chokoreeto", meaning: "Cokelat", script: "katakana", category: "makanan", tip: "Menggunakan yōon チョ (cho) dan vokal panjang レー." },

    /* =========================================================
     * 7. KATAKANA — Barang & Fasilitas Sehari-hari
     * ========================================================= */
    { id: "v-k-118", kana: "テレビ", romaji: "terebi", meaning: "Televisi (TV)", script: "katakana", category: "fasilitas", tip: "Kependekan dari television." },
    { id: "v-k-119", kana: "ラジオ", romaji: "rajio", meaning: "Radio", script: "katakana", category: "fasilitas", tip: "Menggunakan huruf ジ (ji) ber-dakuten." },
    { id: "v-k-120", kana: "カメラ", romaji: "kamera", meaning: "Kamera", script: "katakana", category: "fasilitas", tip: "Konsonan r ringan khas Jepang." },
    { id: "v-k-121", kana: "ベッド", romaji: "beddo", meaning: "Tempat tidur (Bed)", script: "katakana", category: "fasilitas", tip: "Menggunakan sokuon kecil ッ yang menahan bunyi 'd'." },
    { id: "v-k-122", kana: "ドア", romaji: "doa", meaning: "Pintu", script: "katakana", category: "fasilitas", tip: "Dari kata 'door'." },
    { id: "v-k-123", kana: "テーブル", romaji: "teeburu", meaning: "Meja makan / Table", script: "katakana", category: "fasilitas", tip: "Huruf ブ (bu) ber-dakuten." },
    { id: "v-k-124", kana: "トイレ", romaji: "toire", meaning: "Toilet / Kamar kecil", script: "katakana", category: "fasilitas", tip: "Kata paling praktis saat bepergian di Jepang." },
    { id: "v-k-125", kana: "ホテル", romaji: "hoteru", meaning: "Hotel", script: "katakana", category: "fasilitas", tip: "Dari kata 'hotel'." },
    { id: "v-k-126", kana: "レストラン", romaji: "resutoran", meaning: "Restoran", script: "katakana", category: "fasilitas", tip: "Dari kata 'restaurant'." },
    { id: "v-k-127", kana: "デパート", romaji: "depaato", meaning: "Toserba / Department Store", script: "katakana", category: "fasilitas", tip: "Menggunakan huruf デ (de) dan vokal panjang ー." },
    { id: "v-k-128", kana: "バス", romaji: "basu", meaning: "Bus", script: "katakana", category: "fasilitas", tip: "Huruf バ (ba) ber-dakuten." },
    { id: "v-k-129", kana: "タクシー", romaji: "takushii", meaning: "Taksi", script: "katakana", category: "fasilitas", tip: "Vokal 'i' di akhir dipanjangkan dengan ー." },
    { id: "v-k-130", kana: "アパート", romaji: "apaato", meaning: "Apartemen", script: "katakana", category: "fasilitas", tip: "Kependekan dari apartment." },
    { id: "v-k-131", kana: "エレベーター", romaji: "erebeetaa", meaning: "Lift / Elevator", script: "katakana", category: "fasilitas", tip: "Dua kali penggunaan tanda pemanjang vokal ー." },
    { id: "v-k-132", kana: "プール", romaji: "puuru", meaning: "Kolam renang (Pool)", script: "katakana", category: "fasilitas", tip: "Huruf プ (pu) ber-handakuten maru." },

    /* =========================================================
     * 8. KATAKANA — Pakaian & Aksesoris
     * ========================================================= */
    { id: "v-k-133", kana: "シャツ", romaji: "shatsu", meaning: "Kemeja (Shirt)", script: "katakana", category: "pakaian", tip: "Kombinasi yōon シャ (sha) + ツ (tsu) biasa." },
    { id: "v-k-134", kana: "ズボン", romaji: "zubon", meaning: "Celana panjang", script: "katakana", category: "pakaian", tip: "Dari bahasa Prancis 'jupon'." },
    { id: "v-k-135", kana: "スカート", romaji: "sukaato", meaning: "Rok (Skirt)", script: "katakana", category: "pakaian", tip: "Tanda ー memperpanjang vokal 'ka'." },
    { id: "v-k-136", kana: "ネクタイ", romaji: "nekutai", meaning: "Dasi (Necktie)", script: "katakana", category: "pakaian", tip: "Dari kata 'necktie'." },
    { id: "v-k-137", kana: "ポケット", romaji: "poketto", meaning: "Kantong saku (Pocket)", script: "katakana", category: "pakaian", tip: "Menggunakan handakuten ポ (po) dan sokuon ッ." },
    { id: "v-k-138", kana: "コート", romaji: "kooto", meaning: "Jas luar / Mantel (Coat)", script: "katakana", category: "pakaian", tip: "Vokal 'ko' dipanjangkan dengan ー." },
    { id: "v-k-139", kana: "セーター", romaji: "seetaa", meaning: "Sweter (Sweater)", script: "katakana", category: "pakaian", tip: "Dari kata 'sweater'." },

    /* =========================================================
     * 9. KATAKANA — Teknologi & Kegiatan
     * ========================================================= */
    { id: "v-k-140", kana: "パソコン", romaji: "pasokon", meaning: "Komputer / Laptop", script: "katakana", category: "teknologi", tip: "Kependekan khas Jepang dari 'personal computer'." },
    { id: "v-k-141", kana: "スマホ", romaji: "sumaho", meaning: "Smartphone / HP", script: "katakana", category: "teknologi", tip: "Kependekan populer dari 'smart phone'." },
    { id: "v-k-142", kana: "ノート", romaji: "nooto", meaning: "Buku catatan (Notebook)", script: "katakana", category: "teknologi", tip: "Tanda ー memperpanjang vokal 'no'." },
    { id: "v-k-143", kana: "ペン", romaji: "pen", meaning: "Pena / Pulpen", script: "katakana", category: "teknologi", tip: "Huruf ペ (pe) ber-handakuten + ン (n)." },
    { id: "v-k-144", kana: "コピー", romaji: "kopii", meaning: "Fotokopi / Salinan", script: "katakana", category: "teknologi", tip: "Dari kata 'copy'." },
    { id: "v-k-145", kana: "テスト", romaji: "tesuto", meaning: "Ujian / Tes", script: "katakana", category: "teknologi", tip: "Dari kata 'test'." },
    { id: "v-k-146", kana: "ニュース", romaji: "nyuusu", meaning: "Berita (News)", script: "katakana", category: "teknologi", tip: "Kombinasi yōon ニュ (nyu) + vokal panjang." },
    { id: "v-k-147", kana: "スポーツ", romaji: "supootsu", meaning: "Olahraga (Sport)", script: "katakana", category: "teknologi", tip: "Dari kata 'sports'." },
    { id: "v-k-148", kana: "サッカー", romaji: "sakkaa", meaning: "Sepak bola (Soccer)", script: "katakana", category: "teknologi", tip: "Menggunakan sokuon ッ dan vokal panjang ー." },
    { id: "v-k-149", kana: "ギター", romaji: "gitaa", meaning: "Gitar", script: "katakana", category: "teknologi", tip: "Huruf ギ (gi) ber-dakuten." },
    { id: "v-k-150", kana: "ピアノ", romaji: "piano", meaning: "Piano", script: "katakana", category: "teknologi", tip: "Huruf ピ (pi) ber-handakuten." },
    { id: "v-k-151", kana: "ゲーム", romaji: "geemu", meaning: "Permainan / Game", script: "katakana", category: "teknologi", tip: "Huruf ゲ (ge) ber-dakuten + pemanjang vokal ー." }
  ];

  const CATEGORIES = [
    { id: "all", label: "Semua Kategori" },
    { id: "salam", label: "Salam & Ungkapan" },
    { id: "benda", label: "Benda & Lingkungan" },
    { id: "angka-waktu", label: "Angka & Waktu" },
    { id: "kata-kerja", label: "Kata Kerja Dasar" },
    { id: "kata-sifat", label: "Kata Sifat Dasar" },
    { id: "makanan", label: "Makanan & Minuman" },
    { id: "fasilitas", label: "Barang & Fasilitas" },
    { id: "pakaian", label: "Pakaian" },
    { id: "teknologi", label: "Teknologi & Hobi" }
  ];

  function getById(id) {
    return VOCAB.find(function (v) { return v.id === id; }) || null;
  }

  function filterVocab(opts) {
    const o = opts || {};
    const script = o.script || "all";
    const category = o.category || "all";
    const query = (o.query || "").trim().toLowerCase();

    return VOCAB.filter(function (item) {
      if (script !== "all" && item.script !== script) return false;
      if (category !== "all" && item.category !== category) return false;
      if (query) {
        const matchKana = item.kana.toLowerCase().includes(query);
        const matchRomaji = item.romaji.toLowerCase().includes(query);
        const matchMeaning = item.meaning.toLowerCase().includes(query);
        if (!matchKana && !matchRomaji && !matchMeaning) return false;
      }
      return true;
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildVocabQuestion(targetWord, allPool) {
    const pool = (allPool && allPool.length >= 4) ? allPool : VOCAB;
    const candidates = pool.filter(function (w) {
      return w.id !== targetWord.id && w.script === targetWord.script;
    });
    const shuffledCandidates = shuffle(candidates);
    const wrong3 = shuffledCandidates.slice(0, 3);
    const options = shuffle([targetWord].concat(wrong3)).map(function (w) {
      return {
        id: w.id,
        label: w.meaning + " (" + w.romaji + ")",
        meaning: w.meaning,
        romaji: w.romaji
      };
    });

    return {
      isVocab: true,
      entryId: targetWord.id,
      wordId: targetWord.id,
      prompt: targetWord.kana,
      script: targetWord.script,
      options: options,
      answerId: targetWord.id,
      word: targetWord,
      targetWord: targetWord
    };
  }

  root.VocabData = {
    VOCAB: VOCAB,
    CATEGORIES: CATEGORIES,
    getById: getById,
    filterVocab: filterVocab,
    shuffle: shuffle,
    buildVocabQuestion: buildVocabQuestion
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.VocabData;
  }
})(typeof window !== "undefined" ? window : globalThis);
