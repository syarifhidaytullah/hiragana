/* =========================================================
 * writing.js — KanaLearn Interactive Writing Canvas & Access Layer
 * Latihan Menulis Huruf Kana (Hiragana & Katakana) di Handphone & Desktop
 * ========================================================= */

(function (root) {
  "use strict";

  /* =========================================================
   * 1. ACCESS & MONETIZATION LAYER (KanaAccess)
   * Mengatur akses gratis saat ini & arsitektur paywall/lisensi masa depan
   * ========================================================= */
  const ACCESS_STORAGE_KEY = "kanalearn_license_v1";

  const KanaAccess = {
    config: {
      // Saat ini dibuka 100% GRATIS untuk semua pengguna
      // Jika di masa depan ingin dikunci berbayar, ubah freePromo menjadi false
      freePromo: true,
      featureKey: "writing_canvas",
      productName: "Modul Latihan Menulis Hiragana Interaktif",
      checkoutUrl: "https://lynk.id/syarifhidayatullah/yvgnkdzjk212/checkout",
      validCodes: [
        "KANALEARNPRO",
        "HIRAGANAPRO",
        "KANAPRO2026",
        "LYNK2026",
        "BELAJARKANA",
        "PROMO-GRATIS"
      ]
    },

    getLicense: function () {
      try {
        const raw = localStorage.getItem(ACCESS_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    isUnlocked: function () {
      // Selama masa promo / sekarang: selalu terbuka gratis
      if (this.config.freePromo) return true;
      const lic = this.getLicense();
      return !!(lic && lic.active === true);
    },

    activateWithCode: function (code) {
      if (!code) return { success: false, message: "Kode aktivasi tidak boleh kosong." };
      const cleanCode = String(code).trim().toUpperCase();

      // Cek apakah kode cocok dengan daftar lisensi resmi atau pola order Lynk
      const isValid = this.config.validCodes.includes(cleanCode) ||
        cleanCode.startsWith("ORD-") ||
        cleanCode.startsWith("LYNK-") ||
        cleanCode.length >= 8;

      if (isValid) {
        const lic = {
          active: true,
          code: cleanCode,
          activatedAt: new Date().toISOString(),
          type: "lifetime_access"
        };
        localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(lic));
        return {
          success: true,
          message: "🎉 Lisensi berhasil diaktivasi! Akses Pro permanen telah tersimpan di browser ini."
        };
      }

      return {
        success: false,
        message: "Kode lisensi tidak dikenali. Pastikan kode sesuai invoice pembelian Lynk.id Anda."
      };
    },

    // Cek parameter URL redirect dari Lynk.id / email (e.g. ?unlocked=true, ?code=KANAPRO, dll)
    checkUrlActivation: function () {
      if (typeof window === "undefined" || !window.location) return null;
      const params = new URLSearchParams(window.location.search);

      const codeParam = params.get("code") || params.get("license") || params.get("token");
      const unlockParam = params.get("unlock") || params.get("unlocked");
      const orderParam = params.get("order_id") || params.get("ref");

      if (codeParam) {
        const res = this.activateWithCode(codeParam);
        return { triggered: true, success: res.success, message: res.message, type: "code" };
      }

      if (unlockParam === "writing" || unlockParam === "true" || orderParam) {
        const autoCode = orderParam ? "LYNK-" + orderParam : "WEB-PURCHASE-UNLOCKED";
        const res = this.activateWithCode(autoCode);
        return {
          triggered: true,
          success: true,
          message: "🎉 Pembelian terdeteksi! Fitur Latihan Menulis Anda telah aktif permanen.",
          type: "redirect"
        };
      }

      return null;
    }
  };

  /* =========================================================
   * 2. DATASET GORESAN (KanaWritingData)
   * 46 Huruf Hiragana & 46 Katakana Lengkap dengan Urutan & Tips
   * ========================================================= */
  const KanaWritingData = {
    hiragana: [
      // Baris A
      {
        id: "h-a", char: "あ", romaji: "a", group: "a", strokes: 3,
        steps: [
          "Garis mendatar pendek dari kiri ke kanan di bagian atas kuadran.",
          "Garis vertikal melengkung sedikit memotong di tengah ke bawah.",
          "Putaran melingkar searah jarum jam dari kiri bawah melebar ke kanan bawah seperti bentuk pita."
        ],
        vocab: { jp: "あめ", rom: "ame", id: "Hujan / Permen" },
        tip: "Pastikan lingkaran di bawah cukup lebar dan tidak menempel kaku pada garis silang."
      },
      {
        id: "h-i", char: "い", romaji: "i", group: "a", strokes: 2,
        steps: [
          "Garis vertikal melengkung kiri dari atas ke bawah, diakhiri sentakan kait ke kanan atas.",
          "Garis vertikal lebih pendek di kanan melengkung lembut ke dalam."
        ],
        vocab: { jp: "いぬ", rom: "inu", id: "Anjing" },
        tip: "Garis kiri selalu lebih panjang dan memiliki kait (hane), sedangkan garis kanan lebih pendek."
      },
      {
        id: "h-u", char: "う", romaji: "u", group: "a", strokes: 2,
        steps: [
          "Titik koma kecil mendatar sedikit miring di bagian atas.",
          "Garis melengkung membulat besar seperti telinga menghadap ke kiri di bawahnya."
        ],
        vocab: { jp: "うみ", rom: "umi", id: "Laut" },
        tip: "Lengkungan bawah harus proporsional dan berada tepat di bawah titik atas."
      },
      {
        id: "h-e", char: "え", romaji: "e", group: "a", strokes: 2,
        steps: [
          "Titik diagonal kecil di bagian atas kuadran tengah.",
          "Tarik garis miring menyerupai huruf Z, lalu sambung garis mendatar bergelombang di bawahnya."
        ],
        vocab: { jp: "えき", rom: "eki", id: "Stasiun Kereta" },
        tip: "Garis bawah memiliki gelombang lembut seperti atap selancar."
      },
      {
        id: "h-o", char: "お", romaji: "o", group: "a", strokes: 3,
        steps: [
          "Garis mendatar pendek dari kiri ke kanan.",
          "Garis vertikal turun memotong, lalu membuat loop simpul lingkaran di kanan bawah.",
          "Titik aksen miring pendek di kanan atas."
        ],
        vocab: { jp: "おかね", rom: "okane", id: "Uang" },
        tip: "Bedakan dengan あ: huruf お memiliki simpul tertutup di kanan dan titik aksen terpisah di kanan atas."
      },

      // Baris Ka
      {
        id: "h-ka", char: "か", romaji: "ka", group: "ka", strokes: 3,
        steps: [
          "Garis melengkung vertikal ke kanan lalu buat kait kecil di ujung bawah.",
          "Garis diagonal memotong dari kiri atas ke kanan bawah.",
          "Titik aksen miring di bagian kanan atas."
        ],
        vocab: { jp: "かさ", rom: "kasa", id: "Payung" },
        tip: "Jangan lupa sentakan kait pada goresan pertama sebelum membuat garis potong kedua."
      },
      {
        id: "h-ki", char: "き", romaji: "ki", group: "ka", strokes: 4,
        steps: [
          "Garis mendatar pendek pertama di atas.",
          "Garis mendatar kedua sedikit lebih panjang di bawahnya sejajar.",
          "Garis diagonal memotong kedua garis dari kanan atas ke kiri bawah dengan sentakan kail.",
          "Busur kurva melengkung terpisah di bagian bawah menghadap kiri."
        ],
        vocab: { jp: "き", rom: "ki", id: "Pohon" },
        tip: "Pada tulisan tangan baku, busur bawah terputus/terpisah dari garis diagonal pemotong."
      },
      {
        id: "h-ku", char: "く", romaji: "ku", group: "ka", strokes: 1,
        steps: [
          "Satu tarikan membentuk sudut lancip paruh burung (miring kiri bawah lalu kanan bawah)."
        ],
        vocab: { jp: "くるま", rom: "kuruma", id: "Mobil" },
        tip: "Jaga sudut sekitar 60-70 derajat agar seimbang di tengah kuadran kotak."
      },
      {
        id: "h-ke", char: "け", romaji: "ke", group: "ka", strokes: 3,
        steps: [
          "Garis vertikal melengkung di kiri dengan sentakan kait di ujung bawah.",
          "Garis mendatar pendek di sebelah kanan atas.",
          "Garis vertikal memotong dari atas ke kanan bawah melengkung halus."
        ],
        vocab: { jp: "けさ", rom: "kesa", id: "Pagi Ini" },
        tip: "Garis kanan sedikit melengkung ke luar, memberikan postur yang tegak."
      },
      {
        id: "h-ko", char: "こ", romaji: "ko", group: "ka", strokes: 2,
        steps: [
          "Garis mendatar atas dengan sentakan kail kecil ke kiri bawah.",
          "Garis mendatar bawah yang sedikit melengkung membentuk mangkuk terbuka."
        ],
        vocab: { jp: "こども", rom: "kodomo", id: "Anak-anak" },
        tip: "Jarak antara garis atas dan bawah sejajar proporsional, seperti mengapit ruang kosong."
      },

      // Baris Sa
      {
        id: "h-sa", char: "さ", romaji: "sa", group: "sa", strokes: 3,
        steps: [
          "Garis mendatar pendek sedikit miring ke atas.",
          "Garis diagonal memotong ke bawah dengan sentakan kait ke kiri.",
          "Busur kurva melengkung di bagian bawah menghadap ke kiri."
        ],
        vocab: { jp: "さかな", rom: "sakana", id: "Ikan" },
        tip: "Mirip dengan き, tetapi さ hanya memiliki SATU garis mendatar di atas."
      },
      {
        id: "h-shi", char: "し", romaji: "shi", group: "sa", strokes: 1,
        steps: [
          "Satu tarikan vertikal dari atas turun lalu melengkung membulat ke kanan atas seperti mata kail pancing."
        ],
        vocab: { jp: "しんぶん", rom: "shinbun", id: "Koran" },
        tip: "Goresan halus tanpa sudut tajam; biarkan ujung kanan menjulang anggun."
      },
      {
        id: "h-su", char: "す", romaji: "su", group: "sa", strokes: 2,
        steps: [
          "Garis mendatar dari kiri ke kanan.",
          "Garis vertikal memotong, buat loop simpul lingkaran kecil di tengah, lalu turun lurus ke bawah."
        ],
        vocab: { jp: "すし", rom: "sushi", id: "Sushi" },
        tip: "Simpul lingkaran berada tepat di perempatan sumbu vertikal."
      },
      {
        id: "h-se", char: "せ", romaji: "se", group: "sa", strokes: 3,
        steps: [
          "Garis mendatar panjang dari kiri ke kanan.",
          "Garis vertikal di kanan memotong lalu berbelok ke kiri bawah.",
          "Garis vertikal di kiri turun melengkung halus ke kanan bawah."
        ],
        vocab: { jp: "せんせい", rom: "sensei", id: "Guru" },
        tip: "Garis mendatar cukup lebar sebagai pondasi huruf."
      },
      {
        id: "h-so", char: "so", group: "sa", strokes: 1,
        steps: [
          "Satu tarikan: buat bentuk Z di atas lalu menyambung busur melengkung membulat di bawah."
        ],
        vocab: { jp: "そら", rom: "sora", id: "Langit" },
        tip: "Lakukan dalam satu tarikan stabil tanpa mengangkat ujung kuas/pena."
      },

      // Baris Ta
      {
        id: "h-ta", char: "た", romaji: "ta", group: "ta", strokes: 4,
        steps: [
          "Garis mendatar pendek di kiri atas.",
          "Garis miring diagonal memotong garis pertama.",
          "Garis mendatar kecil atas di kanan (seperti こ).",
          "Garis mendatar kecil bawah di kanan."
        ],
        vocab: { jp: "たまご", rom: "tamago", id: "Telur" },
        tip: "Bagian kanan pada dasarnya adalah huruf こ kecil."
      },
      {
        id: "h-chi", char: "ち", romaji: "chi", group: "ta", strokes: 2,
        steps: [
          "Garis mendatar pendek sedikit miring ke atas.",
          "Garis diagonal turun memotong lalu melingkar besar seperti angka 5."
        ],
        vocab: { jp: "ちず", rom: "chizu", id: "Peta" },
        tip: "Jangan tertukar dengan さ: ち menghadap ke kanan dan memiliki perut melingkar."
      },
      {
        id: "h-tsu", char: "つ", romaji: "tsu", group: "ta", strokes: 1,
        steps: [
          "Satu tarikan kurva membulat dari kiri atas ke kanan lalu turun melandai ke kiri bawah seperti gulungan ombak."
        ],
        vocab: { jp: "つき", rom: "tsuki", id: "Bulan" },
        tip: "Mulai mendatar naik perlahan lalu membulat besar dengan luapan lembut."
      },
      {
        id: "h-te", char: "て", romaji: "te", group: "ta", strokes: 1,
        steps: [
          "Satu tarikan garis mendatar ke kanan lalu memutar melengkung halus ke kiri bawah."
        ],
        vocab: { jp: "て", rom: "te", id: "Tangan" },
        tip: "Menyerupai huruf C dengan atap datar di atasnya."
      },
      {
        id: "h-to", char: "と", romaji: "to", group: "ta", strokes: 2,
        steps: [
          "Garis miring pendek dari kiri atas ke kanan bawah.",
          "Lengkungan busur membulat di sebelah kanan menyerupai huruf C terbalik."
        ],
        vocab: { jp: "ともだち", rom: "tomodachi", id: "Teman" },
        tip: "Lengkungan kedua menyentuh ujung goresan miring pertama."
      },

      // Baris Na
      {
        id: "h-na", char: "な", romaji: "na", group: "na", strokes: 4,
        steps: [
          "Garis mendatar pendek di kuadran kiri.",
          "Garis miring memotong garis pertama.",
          "Titik diagonal kecil di kanan atas.",
          "Loop simpul lingkaran vertikal kecil di kanan bawah."
        ],
        vocab: { jp: "なつ", rom: "natsu", id: "Musim Panas" },
        tip: "Simpul lingkaran kanan bawah berukuran kompak dan manis."
      },
      {
        id: "h-ni", char: "に", romaji: "ni", group: "na", strokes: 3,
        steps: [
          "Garis vertikal kiri dengan sentakan kait di ujung bawah.",
          "Garis mendatar pendek atas di sebelah kanan.",
          "Garis mendatar pendek bawah di sebelah kanan."
        ],
        vocab: { jp: "にく", rom: "niku", id: "Daging" },
        tip: "Komposisi kiri garis lurus berkait, kanan adalah pasangan mendatar seperti こ."
      },
      {
        id: "h-nu", char: "ぬ", romaji: "nu", group: "na", strokes: 2,
        steps: [
          "Garis miring diagonal dari kiri atas ke kanan bawah.",
          "Garis dari kanan atas melengkung memotong ke kiri, memutar melingkar besar ke kanan dengan simpul ekor loop di ujung."
        ],
        vocab: { jp: "いぬ", rom: "inu", id: "Anjing" },
        tip: "Pembeda utama dengan め: ぬ memiliki simpul loop kecil di ekor kanan bawah."
      },
      {
        id: "h-ne", char: "ね", romaji: "ne", group: "na", strokes: 2,
        steps: [
          "Garis vertikal lurus di sebelah kiri.",
          "Bentuk Z di tengah, naik melengkung ke kanan dan diakhiri simpul loop di ujung bawah."
        ],
        vocab: { jp: "ねこ", rom: "neko", id: "Kucing" },
        tip: "Bedakan dengan わ dan れ: hanya ね yang memiliki simpul ekor loop melingkar di ujung."
      },
      {
        id: "h-no", char: "の", romaji: "no", group: "na", strokes: 1,
        steps: [
          "Satu tarikan miring dari tengah ke kiri bawah, lalu melingkar spiral besar naik ke kanan atas membulat penuh."
        ],
        vocab: { jp: "のみもの", rom: "nomimono", id: "Minuman" },
        tip: "Gerakan melingkar spiral halus menyerupai lambang dilarang parkir."
      },

      // Baris Ha
      {
        id: "h-ha", char: "は", romaji: "ha", group: "ha", strokes: 3,
        steps: [
          "Garis vertikal kiri dengan sentakan kait di bawah.",
          "Garis mendatar pendek di sebelah kanan atas.",
          "Garis vertikal kanan memotong garis kedua, membentuk simpul loop di bawah lalu mendatar ke kanan."
        ],
        vocab: { jp: "はな", rom: "hana", id: "Bunga / Hidung" },
        tip: "Garis vertikal kedua menembus garis mendatar atas (berbeda dengan ほ yang tidak menembus)."
      },
      {
        id: "h-hi", char: "ひ", romaji: "hi", group: "ha", strokes: 1,
        steps: [
          "Satu tarikan: mendatar sedikit, turun membentuk lekukan U besar membulat ke kanan atas, lalu meluncur ke kanan bawah."
        ],
        vocab: { jp: "ひと", rom: "hito", id: "Orang" },
        tip: "Bentuk menyerupai senyuman lebar dengan kedua lengan sejajar."
      },
      {
        id: "h-fu", char: "ふ", romaji: "fu", group: "ha", strokes: 4,
        steps: [
          "Titik aksen kecil di tengah atas.",
          "Batang melengkung di tengah membentuk kurva hidung.",
          "Titik diagonal miring di sebelah kiri.",
          "Titik diagonal miring di sebelah kanan."
        ],
        vocab: { jp: "ふね", rom: "fune", id: "Perahu" },
        tip: "Posisikan batang tengah tegak seimbang di sumbu vertikal sebelum memberi dua titik kiri-kanan."
      },
      {
        id: "h-he", char: "へ", romaji: "he", group: "ha", strokes: 1,
        steps: [
          "Satu tarikan miring naik pendek ke kanan, lalu melandai panjang ke kanan bawah seperti atap tenda."
        ],
        vocab: { jp: "へや", rom: "heya", id: "Kamar" },
        tip: "Sisi kiri lebih pendek dan curam, sisi kanan lebih panjang dan landai."
      },
      {
        id: "h-ho", char: "ほ", romaji: "ho", group: "ha", strokes: 4,
        steps: [
          "Garis vertikal kiri dengan sentakan kait di bawah.",
          "Garis mendatar atas di sebelah kanan.",
          "Garis mendatar kedua sejajar di bawahnya.",
          "Garis vertikal kanan memotong garis kedua (TIDAK menembus garis atas) lalu membuat simpul loop di bawah."
        ],
        vocab: { jp: "ほん", rom: "hon", id: "Buku" },
        tip: "Perhatian penting: goresan vertikal kanan TIDAK BOLEH menembus garis mendatar paling atas!"
      },

      // Baris Ma
      {
        id: "h-ma", char: "ま", romaji: "ma", group: "ma", strokes: 3,
        steps: [
          "Garis mendatar atas dari kiri ke kanan.",
          "Garis mendatar kedua sejajar di bawahnya.",
          "Garis vertikal memotong kedua garis, membuat simpul loop di kiri bawah lalu mendatar ke kanan."
        ],
        vocab: { jp: "まち", rom: "machi", id: "Kota" },
        tip: "Garis vertikal memotong tembus kedua garis mendatar di atasnya."
      },
      {
        id: "h-mi", char: "み", romaji: "mi", group: "ma", strokes: 2,
        steps: [
          "Garis mendatar melengkung ke kiri bawah, buat simpul loop diagonal, lalu mendatar ke kanan.",
          "Garis miring melengkung memotong dari kanan atas ke bawah."
        ],
        vocab: { jp: "みず", rom: "mizu", id: "Air" },
        tip: "Goresan kedua melengkung anggun memotong ekor goresan pertama."
      },
      {
        id: "h-mu", char: "mu", group: "ma", strokes: 3,
        steps: [
          "Garis mendatar pendek di atas.",
          "Garis vertikal memotong, buat loop simpul di bawah, lalu meliuk naik ke kanan atas.",
          "Titik aksen kecil di kanan atas."
        ],
        vocab: { jp: "むし", rom: "mushi", id: "Serangga" },
        tip: "Jangan lupakan titik aksen di kuadran kanan atas."
      },
      {
        id: "h-me", char: "me", group: "ma", strokes: 2,
        steps: [
          "Garis miring melengkung dari kiri atas ke kanan bawah.",
          "Garis dari kanan atas melengkung ke kiri memotong garis pertama, lalu melingkar oval besar terbuka tanpa simpul."
        ],
        vocab: { jp: "め", rom: "me", id: "Mata" },
        tip: "Mirip dengan ぬ, namun ujung ekor め terbuka bebas tanpa simpul bulatan."
      },
      {
        id: "h-mo", char: "mo", group: "ma", strokes: 3,
        steps: [
          "Garis vertikal melengkung ke kanan atas seperti kail pancing (mirip し).",
          "Garis mendatar pertama memotong batang kail di atas.",
          "Garis mendatar kedua sejajar memotong di bawahnya."
        ],
        vocab: { jp: "もり", rom: "mori", id: "Hutan" },
        tip: "Tarik kail pancing vertikal terlebih dahulu, baru kemudian bubuhkan dua garis mendatar."
      },

      // Baris Ya
      {
        id: "h-ya", char: "ya", group: "ya", strokes: 3,
        steps: [
          "Garis melengkung cembung ke kanan dengan sentakan kait ke kiri di bawah.",
          "Garis titik kecil di kiri atas.",
          "Garis miring memotong busur utama dari kanan atas ke kiri bawah."
        ],
        vocab: { jp: "やま", rom: "yama", id: "Gunung" },
        tip: "Garis pemotong ketiga membentang panjang dan miring kokoh."
      },
      {
        id: "h-yu", char: "yu", group: "ya", strokes: 2,
        steps: [
          "Garis vertikal meliuk, memutar membentuk kurva oval mendatar ke kanan.",
          "Garis vertikal melengkung memotong oval di tengah ke bawah."
        ],
        vocab: { jp: "ゆき", rom: "yuki", id: "Salju" },
        tip: "Garis kedua membelah ruang oval dengan seimbang."
      },
      {
        id: "h-yo", char: "yo", group: "ya", strokes: 2,
        steps: [
          "Garis mendatar pendek di bagian atas.",
          "Garis vertikal turun, buat simpul loop ke kiri lalu mendatar ke kanan."
        ],
        vocab: { jp: "よる", rom: "yoru", id: "Malam" },
        tip: "Simpul melingkar ke kiri lalu mendatar rapi di bawah sumbu."
      },

      // Baris Ra
      {
        id: "h-ra", char: "ra", group: "ra", strokes: 2,
        steps: [
          "Titik koma kecil di bagian atas.",
          "Garis vertikal turun sedikit lalu melengkung membulat besar ke kanan bawah."
        ],
        vocab: { jp: "らいしゅう", rom: "raishuu", id: "Minggu Depan" },
        tip: "Lengkungan bawah mirip angka 5 atau huruf ち tanpa garis silang."
      },
      {
        id: "h-ri", char: "ri", group: "ra", strokes: 2,
        steps: [
          "Garis vertikal pendek di kiri dengan sentakan kait ke kanan.",
          "Garis vertikal panjang di kanan melengkung anggun ke kiri bawah."
        ],
        vocab: { jp: "りんご", rom: "ringo", id: "Apel" },
        tip: "Garis kiri jauh lebih pendek daripada garis kanan."
      },
      {
        id: "h-ru", char: "ru", group: "ra", strokes: 1,
        steps: [
          "Satu tarikan: mendatar, diagonal ke kiri bawah, melengkung membulat seperti angka 3 dengan lingkaran simpul kecil di ujungnya."
        ],
        vocab: { jp: "くるま", rom: "kuruma", id: "Mobil" },
        tip: "Pembeda dengan ろ: huruf る memiliki bulatan simpul tertutup di ujung ekornya."
      },
      {
        id: "h-re", char: "re", group: "ra", strokes: 2,
        steps: [
          "Garis vertikal lurus di sebelah kiri.",
          "Bentuk Z di tengah, naik melengkung ke kanan dengan jentikan melengkung keluar di ujungnya."
        ],
        vocab: { jp: "れきし", rom: "rekishi", id: "Sejarah" },
        tip: "Ujung ekor kanan menjentik keluar ke atas, berbeda dengan ね yang berputar melingkar."
      },
      {
        id: "h-ro", char: "ro", group: "ra", strokes: 1,
        steps: [
          "Satu tarikan: mendatar, diagonal ke kiri bawah, melengkung membulat terbuka seperti angka 3 tanpa simpul."
        ],
        vocab: { jp: "ろうそく", rom: "rousoku", id: "Lilin" },
        tip: "Persis sama dengan る di bagian awal, tetapi berakhir terbuka tanpa bulatan simpul."
      },

      // Baris Wa & N
      {
        id: "h-wa", char: "wa", group: "wa", strokes: 2,
        steps: [
          "Garis vertikal lurus di sebelah kiri.",
          "Bentuk Z pendek, lalu menyambung busur melengkung besar membulat ke kanan terbuka (tanpa simpul dan tanpa jentikan)."
        ],
        vocab: { jp: "わたし", rom: "watashi", id: "Saya" },
        tip: "Lengkungan kanan bulat mulus dan tenang tanpa ekor lentik."
      },
      {
        id: "h-wo", char: "wo", group: "wa", strokes: 3,
        steps: [
          "Garis mendatar pendek di atas.",
          "Garis vertikal diagonal turun lalu menekuk mendatar ke kanan.",
          "Kurva melengkung memotong di bawahnya menyerupai huruf C terbuka."
        ],
        vocab: { jp: "ほんをよむ", rom: "hon o yomu", id: "Membaca Buku (Partikel Objek)" },
        tip: "Hampir selalu difungsikan sebagai partikel penunjuk objek kalimat 'o'."
      },
      {
        id: "h-n", char: "ん", romaji: "n", group: "wa", strokes: 1,
        steps: [
          "Satu tarikan: miring ke bawah, lalu melengkung anggun naik seperti huruf n kecil atau simbol tilde bergelombang."
        ],
        vocab: { jp: "にほん", rom: "nihon", id: "Jepang" },
        tip: "Satu-satunya huruf kana yang mewakili konsonan tunggal tanpa vokal pengiring."
      }
    ],

    katakana: [
      { id: "k-a", char: "ア", romaji: "a", group: "a", strokes: 2, steps: ["Garis mendatar menekuk miring ke kiri bawah.", "Garis lengkung miring dari atas memotong ke bawah."], vocab: { jp: "アイス", rom: "aisu", id: "Es Krim" } },
      { id: "k-i", char: "イ", romaji: "i", group: "a", strokes: 2, steps: ["Garis miring dari kanan atas ke kiri bawah.", "Garis vertikal lurus dari tengah ke bawah."], vocab: { jp: "インク", rom: "inku", id: "Tinta" } },
      { id: "k-u", char: "ウ", romaji: "u", group: "a", strokes: 3, steps: ["Titik vertikal kecil di atas.", "Garis pendek di kiri.", "Garis mendatar lalu menekuk miring ke kiri bawah."], vocab: { jp: "ウイルス", rom: "uirusu", id: "Virus" } },
      { id: "k-e", char: "エ", romaji: "e", group: "a", strokes: 3, steps: ["Garis mendatar atas.", "Garis vertikal di tengah.", "Garis mendatar bawah lebih panjang."], vocab: { jp: "エレベーター", rom: "erebeetaa", id: "Lift / Elevator" } },
      { id: "k-o", char: "オ", romaji: "o", group: "a", strokes: 3, steps: ["Garis mendatar.", "Garis vertikal dengan kail di ujung bawah.", "Garis miring meluncur ke kiri bawah."], vocab: { jp: "オレンジ", rom: "orenji", id: "Jeruk" } },

      { id: "k-ka", char: "カ", romaji: "ka", group: "ka", strokes: 2, steps: ["Garis mendatar menekuk ke bawah dengan kail.", "Garis miring memotong dari atas ke kiri bawah."], vocab: { jp: "カメラ", rom: "kamera", id: "Kamera" } },
      { id: "k-ki", char: "キ", romaji: "ki", group: "ka", strokes: 3, steps: ["Garis mendatar atas.", "Garis mendatar bawah lebih panjang.", "Garis miring memotong kedua garis ke kiri bawah."], vocab: { jp: "キス", rom: "kisu", id: "Ciuman" } },
      { id: "k-ku", char: "ク", romaji: "ku", group: "ka", strokes: 2, steps: ["Garis miring pendek di kiri atas.", "Garis mendatar menekuk melengkung panjang ke kiri bawah."], vocab: { jp: "クラス", rom: "kurasu", id: "Kelas" } },
      { id: "k-ke", char: "ケ", romaji: "ke", group: "ka", strokes: 3, steps: ["Garis miring di kiri atas.", "Garis mendatar di kanan.", "Garis melengkung memotong memanjang ke kiri bawah."], vocab: { jp: "ケーキ", rom: "keeki", id: "Kue / Cake" } },
      { id: "k-ko", char: "コ", romaji: "ko", group: "ka", strokes: 2, steps: ["Garis mendatar menekuk siku ke bawah.", "Garis mendatar bawah menyambung di dasar."], vocab: { jp: "コーヒー", rom: "koohii", id: "Kopi" } },

      { id: "k-sa", char: "サ", romaji: "sa", group: "sa", strokes: 3, steps: ["Garis mendatar panjang.", "Garis vertikal pendek di kiri.", "Garis vertikal kanan lebih panjang melengkung ke kiri."], vocab: { jp: "サラダ", rom: "sarada", id: "Salad" } },
      { id: "k-shi", char: "シ", romaji: "shi", group: "sa", strokes: 3, steps: ["Titik miring atas.", "Titik miring kedua di bawahnya.", "Tarikan panjang dari KIRI BAWAH meluncur ke KANAN ATAS."], vocab: { jp: "シャツ", rom: "shatsu", id: "Kemeja / Shirt" } },
      { id: "k-su", char: "ス", romaji: "su", group: "sa", strokes: 2, steps: ["Garis mendatar menekuk diagonal ke kiri bawah.", "Garis miring dari kanan atas memotong ke kanan bawah."], vocab: { jp: "スポーツ", rom: "supootsu", id: "Olahraga" } },
      { id: "k-se", char: "セ", romaji: "se", group: "sa", strokes: 2, steps: ["Garis mendatar menekuk siku turun ke bawah.", "Garis vertikal melengkung di kanan menekuk mendatar ke kiri."], vocab: { jp: "セーター", rom: "seetaa", id: "Sweter" } },
      { id: "k-so", char: "ソ", romaji: "so", group: "sa", strokes: 2, steps: ["Titik miring di kiri atas.", "Tarikan dari KANAN ATAS meluncur miring curam ke KIRI BAWAH."], vocab: { jp: "ソーダ", rom: "sooda", id: "Soda" } },

      { id: "k-ta", char: "タ", romaji: "ta", group: "ta", strokes: 3, steps: ["Garis miring pendek di kiri atas.", "Garis mendatar menekuk ke kiri bawah.", "Garis miring memotong di dalam kotak."], vocab: { jp: "タクシー", rom: "takushii", id: "Taksi" } },
      { id: "k-chi", char: "チ", romaji: "chi", group: "ta", strokes: 3, steps: ["Garis miring pendek atas dari kanan ke kiri.", "Garis mendatar di bawahnya.", "Garis melengkung memotong memanjang ke kiri bawah."], vocab: { jp: "チーズ", rom: "chiizu", id: "Keju" } },
      { id: "k-tsu", char: "ツ", romaji: "tsu", group: "ta", strokes: 3, steps: ["Dua titik miring mendatar sejajar di atas.", "Tarikan panjang dari KANAN ATAS meluncur curam ke KIRI BAWAH."], vocab: { jp: "ツアー", rom: "tsuaa", id: "Tur / Wisata" } },
      { id: "k-te", char: "テ", romaji: "te", group: "ta", strokes: 3, steps: ["Garis mendatar pendek atas.", "Garis mendatar tengah lebih panjang.", "Garis melengkung dari tengah ke kiri bawah."], vocab: { jp: "テスト", rom: "tesuto", id: "Ujian / Tes" } },
      { id: "k-to", char: "ト", romaji: "to", group: "ta", strokes: 2, steps: ["Garis vertikal lurus.", "Garis miring diagonal dari tengah garis ke kanan bawah."], vocab: { jp: "トイレ", rom: "toire", id: "Toilet" } },

      { id: "k-na", char: "ナ", romaji: "na", group: "na", strokes: 2, steps: ["Garis mendatar.", "Garis melengkung memotong dari atas ke kiri bawah."], vocab: { jp: "ナイフ", rom: "naifu", id: "Pisau" } },
      { id: "k-ni", char: "ニ", romaji: "ni", group: "na", strokes: 2, steps: ["Garis mendatar atas.", "Garis mendatar bawah lebih panjang."], vocab: { jp: "ニュース", rom: "nyuusu", id: "Berita" } },
      { id: "k-nu", char: "ヌ", romaji: "nu", group: "na", strokes: 2, steps: ["Garis mendatar menekuk ke kiri bawah.", "Garis miring memotong dari kanan atas ke kanan bawah."], vocab: { jp: "ヌードル", rom: "nuudoru", id: "Mi / Noodle" } },
      { id: "k-ne", char: "ネ", romaji: "ne", group: "na", strokes: 4, steps: ["Titik kecil di atas.", "Garis miring pendek di kiri.", "Garis mendatar menekuk ke bawah.", "Garis miring ke kanan bawah."], vocab: { jp: "ネクタイ", rom: "nekutai", id: "Dasi" } },
      { id: "k-no", char: "ノ", romaji: "no", group: "na", strokes: 1, steps: ["Satu tarikan garis melengkung dari kanan atas ke kiri bawah."], vocab: { jp: "ノート", rom: "nooto", id: "Buku Catatan" } },

      { id: "k-ha", char: "ハ", romaji: "ha", group: "ha", strokes: 2, steps: ["Garis miring di kiri.", "Garis miring di kanan menjauh membentuk huruf V terbalik."], vocab: { jp: "ハム", rom: "hamu", id: "Daging Ham" } },
      { id: "k-hi", char: "ヒ", romaji: "hi", group: "ha", strokes: 2, steps: ["Garis mendatar pendek di atas.", "Garis vertikal siku ke kanan lalu melengkung ke atas."], vocab: { jp: "ヒーロー", rom: "hiiroo", id: "Pahlawan / Hero" } },
      { id: "k-fu", char: "フ", romaji: "fu", group: "ha", strokes: 1, steps: ["Satu tarikan garis mendatar lalu menekuk melengkung ke kiri bawah."], vocab: { jp: "フルーツ", rom: "furuutsu", id: "Buah-buahan" } },
      { id: "k-he", char: "ヘ", romaji: "he", group: "ha", strokes: 1, steps: ["Satu tarikan miring naik ke kanan lalu turun ke kanan bawah (identik dengan hiragana へ)."], vocab: { jp: "ヘルメット", rom: "herumetto", id: "Helm" } },
      { id: "k-ho", char: "ホ", romaji: "ho", group: "ha", strokes: 4, steps: ["Garis mendatar atas.", "Garis vertikal lurus dengan kail kecil di bawah.", "Garis miring di kiri.", "Garis miring di kanan."], vocab: { jp: "ホテル", rom: "hoteru", id: "Hotel" } },

      { id: "k-ma", char: "マ", romaji: "ma", group: "ma", strokes: 2, steps: ["Garis mendatar menekuk tajam ke kiri bawah.", "Titik aksen pendek di bawah."], vocab: { jp: "マスク", rom: "masuku", id: "Masker" } },
      { id: "k-mi", char: "ミ", romaji: "mi", group: "ma", strokes: 3, steps: ["Tiga garis miring sejajar dari kanan atas ke kiri bawah."], vocab: { jp: "ミルク", rom: "miruku", id: "Susu" } },
      { id: "k-mu", char: "ム", romaji: "mu", group: "ma", strokes: 2, steps: ["Garis miring ke kiri lalu mendatar tajam ke kanan.", "Titik miring pendek di kanan atas."], vocab: { jp: "ムード", rom: "muudo", id: "Suasana / Mood" } },
      { id: "k-me", char: "メ", romaji: "me", group: "ma", strokes: 2, steps: ["Garis miring panjang dari kanan atas ke kiri bawah.", "Garis pendek memotong dari kiri atas ke kanan bawah."], vocab: { jp: "メロン", rom: "meron", id: "Melon" } },
      { id: "k-mo", char: "モ", romaji: "mo", group: "ma", strokes: 3, steps: ["Garis mendatar atas.", "Garis mendatar tengah.", "Garis vertikal menekuk siku ke kanan bawah."], vocab: { jp: "モデル", rom: "moderu", id: "Model" } },

      { id: "k-ya", char: "ヤ", romaji: "ya", group: "ya", strokes: 2, steps: ["Garis mendatar menekuk siku miring ke kiri bawah.", "Garis vertikal miring memotong di kanan."], vocab: { jp: "ヤング", rom: "yangu", id: "Muda / Young" } },
      { id: "k-yu", char: "ユ", romaji: "yu", group: "ya", strokes: 2, steps: ["Garis mendatar menekuk siku ke bawah.", "Garis mendatar bawah lebih panjang."], vocab: { jp: "ユニフォーム", rom: "yunifoomu", id: "Seragam" } },
      { id: "k-yo", char: "ヨ", romaji: "yo", group: "ya", strokes: 3, steps: ["Garis mendatar atas siku ke bawah.", "Garis mendatar tengah.", "Garis mendatar bawah."], vocab: { jp: "ヨーロッパ", rom: "yooroppa", id: "Eropa" } },

      { id: "k-ra", char: "ラ", romaji: "ra", group: "ra", strokes: 2, steps: ["Garis mendatar pendek di atas.", "Garis melengkung menekuk ke kiri bawah."], vocab: { jp: "ラジオ", rom: "rajio", id: "Radio" } },
      { id: "k-ri", char: "ri", group: "ra", strokes: 2, steps: ["Garis vertikal pendek di kiri.", "Garis vertikal panjang melengkung di kanan (serupa huruf hiragana)."], vocab: { jp: "リーダー", rom: "riidaa", id: "Pemimpin / Leader" } },
      { id: "k-ru", char: "ル", romaji: "ru", group: "ra", strokes: 2, steps: ["Garis vertikal miring ke kiri bawah.", "Garis vertikal kanan melengkung ke kanan atas."], vocab: { jp: "ルール", rom: "ruuru", id: "Aturan / Rule" } },
      { id: "k-re", char: "レ", romaji: "re", group: "ra", strokes: 1, steps: ["Satu tarikan vertikal turun lalu melengkung tajam ke kanan atas."], vocab: { jp: "レストラン", rom: "resutoran", id: "Restoran" } },
      { id: "k-ro", char: "ro", group: "ra", strokes: 3, steps: ["Garis vertikal kiri.", "Garis mendatar menekuk siku ke kanan bawah.", "Garis mendatar bawah menutup kotak."], vocab: { jp: "ロボット", rom: "robotto", id: "Robot" } },

      { id: "k-wa", char: "ワ", romaji: "wa", group: "wa", strokes: 2, steps: ["Garis vertikal pendek di kiri.", "Garis mendatar atas menekuk melengkung ke kiri bawah."], vocab: { jp: "ワイン", rom: "wain", id: "Anggur / Wine" } },
      { id: "k-wo", char: "ヲ", romaji: "wo", group: "wa", strokes: 3, steps: ["Garis mendatar atas.", "Garis mendatar kedua sedikit ke bawah.", "Garis melengkung memotong ke kiri."], vocab: { jp: "ヲ (希少)", rom: "wo", id: "Jarang dipakai" } },
      { id: "k-n", char: "ン", romaji: "n", group: "wa", strokes: 2, steps: ["Titik miring di kiri.", "Tarikan dari KIRI BAWAH meluncur ke KANAN ATAS (lebih landai daripada ソ)."], vocab: { jp: "パン", rom: "pan", id: "Roti" } }
    ]
  };

  /* =========================================================
   * 3. CONTROLLER KANVAS LATIHAN MENULIS (KanaWritingCanvas)
   * Mengatur interaksi sentuhan, render garis halus, undo, dan evaluasi
   * ========================================================= */
  function KanaWritingCanvas(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.container = options.container;

    // State kanvas
    this.currentScript = "hiragana";
    this.currentChar = null;
    this.strokes = [];       // Array stroke: [ [{x,y}, {x,y}, ...], ... ]
    this.currentStroke = null;
    this.undoStack = [];
    this.isDrawing = false;

    // Pengaturan alat gambar
    this.brushColor = "#1e293b"; // Warna Sumi
    this.brushSize = 8;
    this.isEraser = false;
    this.showGhost = true;       // Bayangan tracing
    this.showGrid = true;        // Garis kotak Genkouyoushi

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.initEvents();
    this.resize();
  }

  KanaWritingCanvas.prototype.initEvents = function () {
    const self = this;
    const canvas = this.canvas;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    // Pointer Events (Mendukung sentuhan jari HP, Stylus pen, & Mouse)
    canvas.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}

      self.isDrawing = true;
      const pt = getCoords(e);
      self.currentStroke = {
        color: self.isEraser ? "eraser" : self.brushColor,
        size: self.brushSize * self.dpr,
        points: [pt]
      };
      self.redraw();
    });

    canvas.addEventListener("pointermove", function (e) {
      if (!self.isDrawing || !self.currentStroke) return;
      e.preventDefault();
      const pt = getCoords(e);
      self.currentStroke.points.push(pt);
      self.redraw();
    });

    function endStroke(e) {
      if (!self.isDrawing) return;
      self.isDrawing = false;
      if (self.currentStroke && self.currentStroke.points.length > 0) {
        self.strokes.push(self.currentStroke);
        self.currentStroke = null;
      }
      self.redraw();
    }

    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);

    // Mencegah pull-to-refresh & scrolling browser saat menulis di kanvas
    canvas.addEventListener("touchstart", function (e) { e.preventDefault(); }, { passive: false });
    canvas.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });

    window.addEventListener("resize", function () {
      self.resize();
    });
  };

  KanaWritingCanvas.prototype.resize = function () {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const size = Math.min(rect.width, 380);

    this.canvas.style.width = size + "px";
    this.canvas.style.height = size + "px";
    this.canvas.width = Math.round(size * this.dpr);
    this.canvas.height = Math.round(size * this.dpr);

    this.redraw();
  };

  KanaWritingCanvas.prototype.setCharacter = function (charItem, script) {
    this.currentChar = charItem;
    if (script) this.currentScript = script;
    this.clearStrokes();
  };

  KanaWritingCanvas.prototype.clearStrokes = function () {
    this.strokes = [];
    this.currentStroke = null;
    this.redraw();
  };

  KanaWritingCanvas.prototype.undo = function () {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.redraw();
    }
  };

  KanaWritingCanvas.prototype.setBrushColor = function (color) {
    this.isEraser = false;
    this.brushColor = color;
  };

  KanaWritingCanvas.prototype.setBrushSize = function (size) {
    this.brushSize = size;
  };

  KanaWritingCanvas.prototype.setEraser = function (active) {
    this.isEraser = active;
  };

  KanaWritingCanvas.prototype.toggleGhost = function (show) {
    this.showGhost = typeof show === "boolean" ? show : !this.showGhost;
    this.redraw();
    return this.showGhost;
  };

  KanaWritingCanvas.prototype.toggleGrid = function (show) {
    this.showGrid = typeof show === "boolean" ? show : !this.showGrid;
    this.redraw();
    return this.showGrid;
  };

  // Render utama Kanvas
  KanaWritingCanvas.prototype.redraw = function () {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // Bersihkan Kanvas
    ctx.clearRect(0, 0, w, h);

    // Background kanvas putih/kertas jepang
    ctx.fillStyle = isDark ? "#171920" : "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // 1. Gambar Garis Kotak Latihan Genkouyoushi
    if (this.showGrid) {
      this.drawGenkouyoushiGrid(ctx, w, h, isDark);
    }

    // 2. Gambar Karakter Bayangan (Ghost Character / Tracing Mode)
    if (this.showGhost && this.currentChar) {
      this.drawGhostCharacter(ctx, w, h, isDark);
    }

    // 3. Render Goresan Pengguna yang Tersimpan
    for (let i = 0; i < this.strokes.length; i++) {
      this.renderStroke(ctx, this.strokes[i], isDark);
    }

    // 4. Render Goresan Aktif yang Sedang Ditarik Jari
    if (this.currentStroke) {
      this.renderStroke(ctx, this.currentStroke, isDark);
    }
  };

  KanaWritingCanvas.prototype.drawGenkouyoushiGrid = function (ctx, w, h, isDark) {
    ctx.save();
    const pad = Math.round(14 * this.dpr);
    const boxW = w - pad * 2;
    const boxH = h - pad * 2;
    const halfX = w / 2;
    const halfY = h / 2;

    // Bingkai Luar Kotak
    ctx.strokeStyle = isDark ? "#3b4253" : "#cbd5e1";
    ctx.lineWidth = 1.5 * this.dpr;
    ctx.strokeRect(pad, pad, boxW, boxH);

    // Garis Silang Tengah (Dashed Crosshair)
    ctx.setLineDash([4 * this.dpr, 4 * this.dpr]);
    ctx.strokeStyle = isDark ? "#292e3b" : "#e2e8f0";
    ctx.lineWidth = 1.2 * this.dpr;

    // Vertikal tengah
    ctx.beginPath();
    ctx.moveTo(halfX, pad);
    ctx.lineTo(halfX, h - pad);
    ctx.stroke();

    // Horizontal tengah
    ctx.beginPath();
    ctx.moveTo(pad, halfY);
    ctx.lineTo(w - pad, halfY);
    ctx.stroke();

    ctx.restore();
  };

  KanaWritingCanvas.prototype.drawGhostCharacter = function (ctx, w, h, isDark) {
    if (!this.currentChar) return;
    ctx.save();

    const char = this.currentChar.char;
    const fontSize = Math.round(w * 0.62);

    ctx.font = `800 ${fontSize}px "Noto Sans JP", "Zen Kaku Gothic New", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Warna bayangan tipis yang elegan
    ctx.fillStyle = isDark
      ? "rgba(239, 68, 68, 0.22)"
      : "rgba(220, 38, 38, 0.14)";

    ctx.fillText(char, w / 2, h / 2 + Math.round(fontSize * 0.04));
    ctx.restore();
  };

  KanaWritingCanvas.prototype.renderStroke = function (ctx, stroke, isDark) {
    const pts = stroke.points;
    if (!pts || pts.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.color === "eraser") {
      ctx.strokeStyle = isDark ? "#171920" : "#ffffff";
      ctx.lineWidth = stroke.size * 2.2;
    } else {
      ctx.strokeStyle = isDark && stroke.color === "#1e293b" ? "#f3f4f6" : stroke.color;
      ctx.lineWidth = stroke.size;
    }

    if (pts.length === 1) {
      // Titik tunggal
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    } else {
      // Menghubungkan titik dengan kurva kuadratik halus
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      // Titik terakhir
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Evaluasi Kemiripan Coretan Huruf dengan Bentuk Standar
  KanaWritingCanvas.prototype.evaluateAccuracy = function () {
    if (!this.currentChar) return { score: 0, feedback: "Pilih karakter terlebih dahulu." };
    if (this.strokes.length === 0) {
      return { score: 0, feedback: "Silakan tuliskan huruf di atas kanvas terlebih dahulu." };
    }

    const testSize = 120;
    const offCanvas = document.createElement("canvas");
    offCanvas.width = testSize;
    offCanvas.height = testSize;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

    // 1. Render Karakter Referensi
    offCtx.fillStyle = "#ffffff";
    offCtx.fillRect(0, 0, testSize, testSize);
    offCtx.fillStyle = "#000000";
    const fontSize = Math.round(testSize * 0.65);
    offCtx.font = `bold ${fontSize}px "Noto Sans JP", sans-serif`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(this.currentChar.char, testSize / 2, testSize / 2 + 2);

    const refImg = offCtx.getImageData(0, 0, testSize, testSize).data;
    let refPixels = 0;
    const refMask = new Uint8Array(testSize * testSize);

    for (let i = 0; i < refImg.length; i += 4) {
      const idx = i / 4;
      if (refImg[i] < 128) {
        refMask[idx] = 1;
        refPixels++;
      }
    }

    // 2. Render Goresan Pengguna
    offCtx.fillStyle = "#ffffff";
    offCtx.fillRect(0, 0, testSize, testSize);
    offCtx.strokeStyle = "#000000";
    offCtx.lineWidth = 10;
    offCtx.lineCap = "round";
    offCtx.lineJoin = "round";

    const scale = testSize / this.canvas.width;

    for (let s = 0; s < this.strokes.length; s++) {
      const stroke = this.strokes[s];
      if (stroke.color === "eraser") continue;
      const pts = stroke.points;
      if (pts.length > 1) {
        offCtx.beginPath();
        offCtx.moveTo(pts[0].x * scale, pts[0].y * scale);
        for (let i = 1; i < pts.length; i++) {
          offCtx.lineTo(pts[i].x * scale, pts[i].y * scale);
        }
        offCtx.stroke();
      } else if (pts.length === 1) {
        offCtx.beginPath();
        offCtx.arc(pts[0].x * scale, pts[0].y * scale, 5, 0, Math.PI * 2);
        offCtx.fill();
      }
    }

    const userImg = offCtx.getImageData(0, 0, testSize, testSize).data;
    let userPixels = 0;
    let hitPixels = 0;
    let strayPixels = 0;

    // Dilasi toleransi buffer (3 piksel radius)
    for (let y = 0; y < testSize; y++) {
      for (let x = 0; x < testSize; x++) {
        const idx = y * testSize + x;
        const isUser = userImg[idx * 4] < 128;
        if (isUser) {
          userPixels++;
          let hit = false;
          for (let dy = -3; dy <= 3 && !hit; dy++) {
            for (let dx = -3; dx <= 3 && !hit; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (nx >= 0 && nx < testSize && ny >= 0 && ny < testSize) {
                if (refMask[ny * testSize + nx] === 1) {
                  hit = true;
                }
              }
            }
          }
          if (hit) hitPixels++;
          else strayPixels++;
        }
      }
    }

    if (userPixels < 60) {
      return { score: 0, feedback: "Coretan terlalu sedikit. Lanjutkan goresan hingga huruf selesai." };
    }

    const recall = Math.min(1.0, hitPixels / Math.max(1, refPixels * 0.8));
    const precision = Math.max(0, 1.0 - (strayPixels / Math.max(1, userPixels + 30)));
    const rawScore = Math.round((0.6 * recall + 0.4 * precision) * 100);
    const score = Math.max(15, Math.min(98, rawScore));

    let feedback = "";
    let grade = "";

    if (score >= 82) {
      grade = "Sempurna! 🌟";
      feedback = "Bentuk dan proporsi huruf sangat akurat sesuai standar kaligrafi Kana.";
    } else if (score >= 68) {
      grade = "Bagus Sekali! 👍";
      feedback = "Bentuk huruf sudah jelas dan proporsional. Terus latih konsistensi kelengkungan.";
    } else if (score >= 50) {
      grade = "Cukup Bagus! ✏️";
      feedback = "Bentuk terbaca, namun perhatikan batas garis silang agar huruf tidak miring.";
    } else {
      grade = "Terus Berlatih! 💪";
      feedback = "Gunakan bantuan garis bayangan (tracing) untuk melatih memori otot tangan Anda.";
    }

    return {
      score: score,
      grade: grade,
      feedback: feedback,
      strokesDrawn: this.strokes.length,
      expectedStrokes: this.currentChar.strokes
    };
  };

  /* Expose Global Modules */
  root.KanaAccess = KanaAccess;
  root.KanaWritingData = KanaWritingData;
  root.KanaWritingCanvas = KanaWritingCanvas;

})(typeof window !== "undefined" ? window : globalThis);
