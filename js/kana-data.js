/* =========================================================
 * kana-data.js — KanaLearn data layer (schema v1)
 *
 * Isi:
 *  - KANA        : semua karakter (hiragana + katakana), digenerate dari tabel baris
 *  - SPECIAL     : sokuon (っ/ッ), chōonpu (ー) — tidak masuk pool quiz romaji
 *  - LESSONS     : daftar lesson (baris dasar, dakuten, handakuten, yōon, tambahan)
 *  - CONFUSABLES : kelompok karakter yang mirip
 *  - Helper      : getById, byScript, matchRomaji, makeDistractors, tipFor, dll.
 *
 * Romanisasi: Hepburn. を dibaca "o" (alternatif input: "wo").
 * Pemakaian:  <script src="js/kana-data.js"></script>  →  window.KanaData
 * ========================================================= */
(function (root) {
  "use strict";

  const SCHEMA_VERSION = 1;

  /* ---------- 1. Tabel baris dasar ---------- */
  // ids (opsional) = pengganti romaji untuk pembentukan id agar tidak bentrok
  const ROWS = [
    { group: "a",  type: "basic", romaji: ["a","i","u","e","o"],      hira: "あいうえお", kata: "アイウエオ" },
    { group: "ka", type: "basic", romaji: ["ka","ki","ku","ke","ko"], hira: "かきくけこ", kata: "カキクケコ" },
    { group: "sa", type: "basic", romaji: ["sa","shi","su","se","so"],hira: "さしすせそ", kata: "サシスセソ" },
    { group: "ta", type: "basic", romaji: ["ta","chi","tsu","te","to"],hira:"たちつてと", kata: "タチツテト" },
    { group: "na", type: "basic", romaji: ["na","ni","nu","ne","no"], hira: "なにぬねの", kata: "ナニヌネノ" },
    { group: "ha", type: "basic", romaji: ["ha","hi","fu","he","ho"], hira: "はひふへほ", kata: "ハヒフヘホ" },
    { group: "ma", type: "basic", romaji: ["ma","mi","mu","me","mo"], hira: "まみむめも", kata: "マミムメモ" },
    { group: "ya", type: "basic", romaji: ["ya","yu","yo"],           hira: "やゆよ",     kata: "ヤユヨ" },
    { group: "ra", type: "basic", romaji: ["ra","ri","ru","re","ro"], hira: "らりるれろ", kata: "ラリルレロ" },
    { group: "wa", type: "basic", romaji: ["wa","o"],                 hira: "わを",       kata: "ワヲ", ids: ["wa","wo"] },
    { group: "n",  type: "basic", romaji: ["n"],                      hira: "ん",         kata: "ン" },

    { group: "ga", type: "dakuten", romaji: ["ga","gi","gu","ge","go"], hira: "がぎぐげご", kata: "ガギグゲゴ" },
    { group: "za", type: "dakuten", romaji: ["za","ji","zu","ze","zo"], hira: "ざじずぜぞ", kata: "ザジズゼゾ" },
    { group: "da", type: "dakuten", romaji: ["da","ji","zu","de","do"], hira: "だぢづでど", kata: "ダヂヅデド",
      ids: ["da","dji","dzu","de","do"] },
    { group: "ba", type: "dakuten", romaji: ["ba","bi","bu","be","bo"], hira: "ばびぶべぼ", kata: "バビブベボ" },

    { group: "pa", type: "handakuten", romaji: ["pa","pi","pu","pe","po"], hira: "ぱぴぷぺぽ", kata: "パピプペポ" }
  ];

  /* ---------- 2. Yōon (huruf dasar + ya/yu/yo kecil) ---------- */
  const YOON = [
    { base: "ki",  hira: "き", kata: "キ", romaji: ["kya","kyu","kyo"] },
    { base: "gi",  hira: "ぎ", kata: "ギ", romaji: ["gya","gyu","gyo"] },
    { base: "shi", hira: "し", kata: "シ", romaji: ["sha","shu","sho"] },
    { base: "ji",  hira: "じ", kata: "ジ", romaji: ["ja","ju","jo"] },
    { base: "chi", hira: "ち", kata: "チ", romaji: ["cha","chu","cho"] },
    { base: "ni",  hira: "に", kata: "ニ", romaji: ["nya","nyu","nyo"] },
    { base: "hi",  hira: "ひ", kata: "ヒ", romaji: ["hya","hyu","hyo"] },
    { base: "bi",  hira: "び", kata: "ビ", romaji: ["bya","byu","byo"] },
    { base: "pi",  hira: "ぴ", kata: "ピ", romaji: ["pya","pyu","pyo"] },
    { base: "mi",  hira: "み", kata: "ミ", romaji: ["mya","myu","myo"] },
    { base: "ri",  hira: "り", kata: "リ", romaji: ["rya","ryu","ryo"] }
  ];
  const SMALL = {
    hiragana: ["ゃ", "ゅ", "ょ"],
    katakana: ["ャ", "ュ", "ョ"],
    romaji:   ["ya", "yu", "yo"]
  };

  /* ---------- 3. Katakana tambahan (kata serapan) — Phase 2 ---------- */
  // [kana, romaji, altRomaji]
  const KATA_EXTENDED = [
    ["ファ","fa",["hwa"]], ["フィ","fi",["hwi"]], ["フェ","fe",["hwe"]], ["フォ","fo",["hwo"]],
    ["ティ","ti"], ["ディ","di"], ["トゥ","tu"], ["ドゥ","du"],
    ["ウィ","wi"], ["ウェ","we"], ["ウォ","wo"],
    ["シェ","she",["sye"]], ["ジェ","je",["jye","zye"]], ["チェ","che",["tye"]],
    ["ヴ","vu"]
  ];

  /* ---------- 4. Karakter khusus (tidak masuk quiz romaji) ---------- */
  const SPECIAL = [
    { id: "h-sokuon", script: "hiragana", kana: "っ", name: "Sokuon",
      desc: "Tsu kecil: menahan konsonan berikutnya. Contoh: きって (kitte), ざっし (zasshi).",
      tip: "Beri jeda sangat singkat sebelum konsonan berikutnya, seperti menahan napas sejenak. Bukan dibaca “tsu”." },
    { id: "k-sokuon", script: "katakana", kana: "ッ", name: "Sokuon",
      desc: "Tsu kecil Katakana. Contoh: カップ (kappu), ベッド (beddo).",
      tip: "Sama seperti っ: tahan konsonan berikutnya sepanjang satu ketukan." },
    { id: "k-choonpu", script: "katakana", kana: "ー", name: "Chōonpu",
      desc: "Tanda vokal panjang di Katakana. Contoh: コーヒー (kōhī), ケーキ (kēki).",
      tip: "Panjangkan vokal sebelumnya menjadi dua ketukan. Perbedaan panjang bisa mengubah arti kata." }
  ];

  /* ---------- 5. Karakter mirip (bahan latihan pembeda) ---------- */
  const CONFUSABLES = {
    hiragana: [["ぬ","め"], ["わ","れ","ね"], ["さ","き"], ["は","ほ"], ["い","り"], ["る","ろ"], ["あ","お"], ["ま","も"]],
    katakana: [["シ","ツ"], ["ソ","ン"], ["ク","タ"], ["ウ","ワ"], ["コ","ユ"], ["ヌ","ス"], ["ナ","メ"], ["ア","マ"]]
  };

  /* ---------- 6. Romaji alternatif (untuk mode ketik) ---------- */
  const ALT_BY_ROMAJI = {
    shi: ["si"], chi: ["ti"], tsu: ["tu"], fu: ["hu"], ji: ["zi"],
    sha: ["sya"], shu: ["syu"], sho: ["syo"],
    ja: ["jya", "zya"], ju: ["jyu", "zyu"], jo: ["jyo", "zyo"],
    cha: ["tya"], chu: ["tyu"], cho: ["tyo"]
  };
  const ALT_BY_KANA = {
    "を": ["wo"], "ヲ": ["wo"],
    "ん": ["nn"], "ン": ["nn"],
    "ぢ": ["di", "zi"], "ヂ": ["di", "zi"],
    "づ": ["du"],      "ヅ": ["du"]
  };

  /* ---------- 7. Tips pelafalan untuk penutur Indonesia ---------- */
  const TIPS_BY_ROMAJI = {
    u:   "Vokal “u” Jepang lebih datar, bibir tidak dibulatkan sebulat “u” Indonesia.",
    shi: "Dibaca seperti “syi” dalam bahasa Indonesia (bukan “si”).",
    chi: "Dibaca seperti “ci” dalam bahasa Indonesia (bukan “khi”).",
    tsu: "Bunyi “ts” diikuti “u” (seperti pada “tsunami”). Tidak ada padanan persis di bahasa Indonesia.",
    fu:  "Antara “fu” dan “hu”: hembuskan udara pelan dari bibir yang hampir tertutup.",
    ji:  "Dibaca “ji” seperti “jin” (bukan “dji”). じ dan ぢ berbunyi sama; じ jauh lebih sering dipakai.",
    zu:  "Dibaca “zu”. ず dan づ berbunyi sama; ず jauh lebih sering dipakai.",
    o:   "Sebagai partikel, を dibaca “o”, bukan “wo”.",
    n:   "Bunyi ん menyesuaikan bunyi sesudahnya (n, m, atau ng) dan dihitung satu ketukan penuh.",
    sha: "Dibaca “sya”. Satu ketukan, bukan “shi-ya”.",
    shu: "Dibaca “syu”. Satu ketukan.",
    sho: "Dibaca “syo”. Satu ketukan.",
    cha: "Dibaca “cya/ca”. Satu ketukan.",
    chu: "Dibaca “cyu/cu”. Satu ketukan.",
    cho: "Dibaca “cyo/co”. Satu ketukan.",
    ja:  "Dibaca “ja” (seperti “jam”). Satu ketukan.",
    ju:  "Dibaca “ju”. Satu ketukan.",
    jo:  "Dibaca “jo”. Satu ketukan."
  };
  ["ra","ri","ru","re","ro"].forEach(function (r) {
    TIPS_BY_ROMAJI[r] = "Huruf “r” Jepang ringan: ujung lidah menyentuh langit-langit sekali, terdengar antara r, l, dan d.";
  });
  const TIPS_BY_TYPE = {
    yoon: "Yōon dibaca satu ketukan. Huruf kecil ゃ/ゅ/ょ menyatu dengan huruf sebelumnya, bukan suku kata terpisah.",
    extended: "Kombinasi ini dipakai untuk kata serapan asing, misalnya ファン (fan) dan パーティー (pāchī)."
  };

  /* ---------- 8. Pembangun data ---------- */
  function buildScript(script) {
    const isH = script === "hiragana";
    const prefix = isH ? "h" : "k";
    const out = [];
    let order = 0;

    function push(o) {
      out.push(Object.assign({
        script: script,
        altRomaji: [],
        base: null,
        small: null,
        phase: 1,
        quiz: true,
        quizRomajiToKana: true,
        similarTo: [],
        order: order++
      }, o));
    }

    ROWS.forEach(function (row) {
      const chars = Array.from(isH ? row.hira : row.kata);
      chars.forEach(function (kana, i) {
        const romaji = row.romaji[i];
        const idPart = (row.ids && row.ids[i]) || romaji;
        push({
          id: prefix + "-" + idPart,
          kana: kana,
          romaji: romaji,
          altRomaji: ALT_BY_KANA[kana] || ALT_BY_ROMAJI[romaji] || [],
          type: row.type,
          group: row.group,
          audio: "assets/audio/" + romaji + ".mp3"
        });
      });
    });

    YOON.forEach(function (y) {
      const base = isH ? y.hira : y.kata;
      const smalls = isH ? SMALL.hiragana : SMALL.katakana;
      smalls.forEach(function (sm, i) {
        const romaji = y.romaji[i];
        push({
          id: prefix + "-" + romaji,
          kana: base + sm,
          romaji: romaji,
          altRomaji: ALT_BY_ROMAJI[romaji] || [],
          type: "yoon",
          group: "yoon-" + y.base,
          base: base,
          small: sm,
          audio: "assets/audio/" + romaji + ".mp3"
        });
      });
    });

    if (!isH) {
      KATA_EXTENDED.forEach(function (x) {
        push({
          id: "k-ext-" + x[1],
          kana: x[0],
          romaji: x[1],
          altRomaji: x[2] || [],
          type: "extended",
          group: "extended",
          phase: 2,
          audio: "assets/audio/" + x[1] + ".mp3"
        });
      });
    }

    // Tandai entri yang bunyinya bentrok dengan entri LEBIH AWAL
    // → tidak dipakai sebagai jawaban pada mode Romaji → Kana / ketik.
    out.forEach(function (e) {
      const mine = soundSet(e);
      for (let j = 0; j < out.length; j++) {
        const other = out[j];
        if (other.order >= e.order) break;
        if (other.kana !== e.kana && soundSet(other).some(function (s) { return mine.indexOf(s) !== -1; })) {
          e.quizRomajiToKana = false;
          break;
        }
      }
    });

    // Hubungkan karakter mirip
    CONFUSABLES[script].forEach(function (grp) {
      const ents = grp.map(function (k) { return out.find(function (e) { return e.kana === k; }); }).filter(Boolean);
      ents.forEach(function (e) {
        e.similarTo = ents.filter(function (o) { return o.id !== e.id; }).map(function (o) { return o.id; });
      });
    });

    return out;
  }

  function soundSet(e) {
    return [e.romaji].concat(e.altRomaji || []);
  }

  const KANA = buildScript("hiragana").concat(buildScript("katakana"));
  const BY_ID = {};
  KANA.forEach(function (e) { BY_ID[e.id] = e; });

  /* ---------- 9. Lesson ---------- */
  const TYPE_LABEL = { basic: "", dakuten: "Dakuten — ", handakuten: "Handakuten — " };
  const SCRIPT_LABEL = { hiragana: "Hiragana", katakana: "Katakana" };

  function buildLessons() {
    const lessons = [];
    ["hiragana", "katakana"].forEach(function (script) {
      const pool = KANA.filter(function (e) { return e.script === script; });
      const seen = [];
      pool.forEach(function (e) { if (seen.indexOf(e.group) === -1) seen.push(e.group); });

      seen.forEach(function (group) {
        const ents = pool.filter(function (e) { return e.group === group; });
        const t = ents[0].type;
        let title;
        if (t === "yoon") {
          title = SCRIPT_LABEL[script] + " Yōon — " + group.replace("yoon-", "").toUpperCase() + " + YA/YU/YO";
        } else if (t === "extended") {
          title = "Katakana Tambahan (kata serapan)";
        } else {
          title = (t === "basic" ? SCRIPT_LABEL[script] + " — " : SCRIPT_LABEL[script] + " " + TYPE_LABEL[t]) +
                  "Baris " + group.toUpperCase();
        }
        lessons.push({
          id: script.charAt(0) + "-lesson-" + group,
          script: script,
          type: t,
          group: group,
          title: title,
          phase: ents[0].phase,
          entryIds: ents.map(function (e) { return e.id; })
        });
      });
    });
    return lessons;
  }
  const LESSONS = buildLessons();

  /* ---------- 10. Helper ---------- */
  function getById(id) { return BY_ID[id] || null; }

  function byScript(script, opts) {
    const o = opts || {};
    return KANA.filter(function (e) {
      return e.script === script &&
             (!o.type || e.type === o.type) &&
             (!o.maxPhase || e.phase <= o.maxPhase);
    });
  }

  function normalize(s) {
    return String(s || "").toLowerCase().replace(/[\s'’-]/g, "");
  }

  // Cocokkan jawaban ketikan pengguna dengan romaji (termasuk alternatif)
  function matchRomaji(entry, input) {
    const v = normalize(input);
    return soundSet(entry).some(function (s) { return normalize(s) === v; });
  }

  function sameSound(a, b) {
    const sb = soundSet(b);
    return soundSet(a).some(function (s) { return sb.indexOf(s) !== -1; });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /**
   * Buat pilihan jawaban salah (distraktor).
   *  mode "romaji": pilihan berupa romaji (soal Kana → Romaji)
   *  mode "kana"  : pilihan berupa kana   (soal Romaji → Kana)
   * Prioritas: karakter mirip → basis yōon sama → baris sama → tipe sama → lainnya.
   * Tidak akan menghasilkan pilihan yang bunyinya sama dengan jawaban.
   */
  function makeDistractors(entry, n, opts) {
    const o = opts || {};
    const count = n || 3;
    const mode = o.mode || "romaji";
    const maxPhase = o.maxPhase || 2;

    const candidates = KANA.filter(function (e) {
      return e.script === entry.script &&
             e.id !== entry.id &&
             e.phase <= maxPhase &&
             !sameSound(e, entry) &&
             (mode === "romaji" || e.quizRomajiToKana);
    });

    function tier(e) {
      if (entry.similarTo.indexOf(e.id) !== -1) return 0;
      if (entry.type === "yoon" && e.type === "yoon" && e.base === entry.base) return 1;
      if (e.group === entry.group) return 2;
      if (e.type === entry.type) return 3;
      return 4;
    }

    const sorted = shuffle(candidates).sort(function (a, b) { return tier(a) - tier(b); });
    const picked = [];
    const keys = {};
    for (let i = 0; i < sorted.length && picked.length < count; i++) {
      const key = mode === "romaji" ? sorted[i].romaji : sorted[i].kana;
      if (keys[key]) continue;
      keys[key] = true;
      picked.push(sorted[i]);
    }
    return picked;
  }

  // Bangun satu soal pilihan ganda siap render
  function buildQuestion(entry, mode, opts) {
    const distractors = makeDistractors(entry, 3, Object.assign({ mode: mode === "romaji-to-kana" ? "kana" : "romaji" }, opts));
    const toKana = mode === "romaji-to-kana";
    const options = shuffle([entry].concat(distractors)).map(function (e) {
      return { id: e.id, label: toKana ? e.kana : e.romaji };
    });
    return {
      entryId: entry.id,
      mode: mode,
      prompt: toKana ? entry.romaji : entry.kana,
      options: options,
      answerId: entry.id
    };
  }

  function tipFor(entry) {
    return TIPS_BY_ROMAJI[entry.romaji] || TIPS_BY_TYPE[entry.type] || null;
  }

  function progressKeyList() {
    return KANA.map(function (e) { return e.id; });
  }

  root.KanaData = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    KANA: KANA,
    SPECIAL: SPECIAL,
    LESSONS: LESSONS,
    CONFUSABLES: CONFUSABLES,
    getById: getById,
    byScript: byScript,
    matchRomaji: matchRomaji,
    makeDistractors: makeDistractors,
    buildQuestion: buildQuestion,
    tipFor: tipFor,
    shuffle: shuffle,
    progressKeyList: progressKeyList
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.KanaData;
  }
})(typeof window !== "undefined" ? window : globalThis);
