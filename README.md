# KanaLearn (かなラーン)

Website pembelajaran statis interaktif untuk menguasai karakter **Hiragana & Katakana** dasar, aturan perubahan bunyi **Dakuten & Handakuten**, serta kombinasi **Yōon (きゃ, きゅ, きょ)** dengan alur belajar terstruktur: *Lihat → Dengar → Ingat → Uji*.

---

## 🌟 Fitur Utama

1. **Eksplorasi Karakter Lengkap (224 Karakter):**
   - Hiragana & Katakana Seion (Dasar A–N).
   - Dakuten & Handakuten (Ga, Za, Da, Ba, Pa).
   - Yōon / Kombinasi (33 kombinasi Kya, Sha, Cha, Nya, Hya, Mya, Rya, Gya, Ja, Bya, Pya).
   - Karakter Khusus: Sokuon (っ / ッ) dan Chōonpu (ー).
   - Filter cepat, pencarian real-time (romaji/kana).

2. **Fokus Khusus Yōon (Kombinasi):**
   - Visualisasi rumus penggabungan: `き (ki) + ゃ (kecil) = きゃ (kya)` (1 ketukan).
   - Tabel grup interaktif lengkap dengan audio pelafalan.

3. **Latihan Pembeda Karakter Mirip (Confusables Drill):**
   - Menghindari jebakan karakter serupa seperti:
     - Hiragana: ぬ vs め, さ vs き, は vs ほ, わ vs れ vs ね, い vs り, る vs ろ.
     - Katakana: シ vs ツ, ソ vs ン, ク vs タ, ウ vs ワ.
   - Dilengkapi catatan perbedaan goresan dan arah tarikan garis.

4. **Audio Pronunciation & Tips Fonetik Indonesia:**
   - Menggunakan **Web Speech API (`ja-JP`)** dengan tempo yang disesuaikan untuk pelajar pemula.
   - Tips artikulasi khusus penutur bahasa Indonesia (misal: vokal *u* Jepang lebih datar, *shi* dibaca seperti *syi*, *r* Jepang ringan seperti perpaduan r/l/d).

5. **Latihan Flashcard Interaktif (Active Recall):**
   - Efek 3D Flip Card.
   - Tombol *"Belum Tahu"* vs *"Sudah Tahu"*.
   - Shortcut keyboard: `Spasi` (balik kartu), `1` (belum tahu), `2` (sudah tahu), `A` (putar audio).

6. **Kuis Pilihan Ganda & Ketik:**
   - 3 Mode: Kana → Romaji, Romaji → Kana, dan Mode Ketik Romaji (dengan toleransi Hepburn seperti *shi/si*, *tsu/tu*, *wo/o*).
   - Distraktor cerdas berbasis karakter mirip dari `KanaData.buildQuestion`.
   - Sound FX via Web Audio API synthesizer (bebas file eksternal).
   - Penjelasan langsung ketika jawaban salah beserta tips pelafalan.

7. **Latihan Membaca Kosakata Dasar N5 (151 Kata):**
   - 100% ditulis dalam huruf Kana murni (Hiragana & Katakana, tanpa kanji) untuk melatih kelancaran membaca kata utuh sebelum beralih ke Kanji.
   - Dilengkapi audio pelafalan asli (Web Speech API), arti bahasa Indonesia, dan catatan kontekstual.
   - Mode Uji Baca: Opsi sembunyikan romaji untuk melatih *active decoding*.
   - Mode Latihan Kilat (Drill per kata) & Integrasi Kuis Kosakata N5.
   - CTA Alami ke modul lanjutan: **Starter Kit Kanji N5** di Lynk.id.

8. **Kanvas Latihan Menulis Kana Interaktif (Mobile & Touch Friendly):**
   - Latihan motorik tangan langsung di layar HP/tablet dengan **HTML5 Canvas** (Pointer Events, retina display scaling, anti-lag).
   - Kotak latihan bergaris silang **Genkouyoushi** 4 kuadran untuk menjaga proporsi huruf.
   - **Mode Tracing Bayangan (Ghost Kana):** Menampilkan panduan bentuk huruf tipis yang dapat di-toggle aktif/nonaktif untuk tes hafalan mandiri.
   - **Panduan Urutan Goresan (Stroke Order):** Rincian langkah demi langkah resmi per goresan dalam bahasa Indonesia.
   - **Cek Akurasi Goresan Otomatis:** Algoritma evaluasi piksel yang membandingkan goresan pengguna dengan cetakan standar huruf dan memberikan feedback skor (0–100%).
   - Peralatan gambar lengkap: Pilihan warna tinta Sumi (hitam), Vermilion (merah), Indigo (biru), kuas, penghapus, Batal (Undo), dan Bersihkan.
   - Terhubung langsung dengan audio pelafalan asli dan status hafalan (`Storage.isMastered`).
   - **Arsitektur Monetisasi & Lisensi (`KanaAccess`):** Berjalan dalam status **Akses Terbuka Gratis** saat ini, dengan arsitektur paywall/lisensi yang siap mendeteksi URL aktivasi otomatis (`?unlocked=writing`, `?code=...`) serta dialog aktivasi kode pesanan Lynk.id/Mayar.

9. **Tracking Progres & Antrean Salah:**
   - Disimpan secara lokal di browser (`localStorage`).
   - Melacak akurasi kuis, persentase penguasaan huruf, dan streak belajar harian.
   - Antrean karakter yang pernah salah otomatis dikumpulkan untuk latihan ulang.

---

## 📁 Struktur Berkas

```
kana-learn/
├── index.html          # Aplikasi web single-page (SPA) responsif
├── css/
│   └── style.css       # Desain sistem modern bernuansa Jepang, bebas slop
├── js/
│   ├── kana-data.js    # Data layer Kana, lesson, confusables & distractor generator
│   ├── vocab-data.js   # Dataset 151 kosakata dasar N5 (Hiragana & Katakana tanpa kanji)
│   ├── writing.js      # Engine kanvas menulis, dataset goresan & layer lisensi/akses
│   ├── storage.js      # Pengelola state & metrik di localStorage
│   ├── audio.js        # Engine suara: Web Speech API (ja-JP) + Web Audio API SFX
│   └── app.js          # Controller aplikasi, filter, modal, flashcard, kanvas tulis & kuis
└── README.md
```

## 🚀 Cara Menjalankan

Website ini 100% statis tanpa dependensi backend atau node server.

- **Buka Langsung:** Buka file `/home/rifs/kana-learn/index.html` langsung di browser mana pun (Chrome, Firefox, Safari, Edge).
- **Atau gunakan static server lokal (opsional):**
  ```bash
  cd /home/rifs/kana-learn
  python3 -m http.server 8080
  # Buka http://localhost:8080 di browser
  ```
