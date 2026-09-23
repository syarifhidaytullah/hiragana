/* =========================================================
 * app.js — KanaLearn Main Application Controller
 * Menghubungkan KanaData, KanaAudio, KanaStorage, dan UI
 * ========================================================= */

(function () {
  "use strict";

  const KD = window.KanaData;
  const VD = window.VocabData;
  const Storage = window.KanaStorage;
  const Audio = window.KanaAudio;

  if (!KD || !Storage || !Audio) {
    console.error("Modul penting (KanaData, KanaStorage, atau KanaAudio) tidak terdeteksi.");
    return;
  }

  // App State
  let currentScript = "hiragana"; // 'hiragana' | 'katakana'
  let currentFilter = "all";      // 'all' | 'basic' | 'dakuten' | 'yoon' | 'confusables' | 'special'
  let searchQuery = "";
  let currentRenderedKanaList = [];

  // Vocab State
  let currentVocabScript = "all"; // 'all' | 'hiragana' | 'katakana'
  let currentVocabCategory = "all";
  let vocabSearchQuery = "";
  let isVocabRomajiHidden = false;
  let isVocabDrillActive = false;
  let vocabDrillIndex = 0;
  let vocabDrillList = [];

  // Flashcard State
  let flashcardDeck = [];
  let flashcardIndex = 0;
  let isCardFlipped = false;

  // Quiz State
  let quizMode = "kana-to-romaji"; // 'kana-to-romaji' | 'romaji-to-kana' | 'typing'
  let quizQuestions = [];
  let currentQuizIndex = 0;
  let quizScore = 0;
  let quizMissed = [];

  // DOM Elements
  const navLinks = document.querySelectorAll("[data-nav]");
  const tabViews = document.querySelectorAll(".tab-view");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const streakDisplay = document.getElementById("streakDisplay");
  const heroProgressFill = document.getElementById("heroProgressFill");
  const heroProgressText = document.getElementById("heroProgressText");
  const heroHiraCount = document.getElementById("heroHiraCount");
  const heroKataCount = document.getElementById("heroKataCount");

  // Router / Nav switch
  function switchTab(tabId) {
    tabViews.forEach(v => {
      if (v.id === tabId) {
        v.classList.add("active");
      } else {
        v.classList.remove("active");
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute("data-nav") === tabId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Refresh view specific contents
    if (tabId === "learnTab") renderKanaSection();
    if (tabId === "writeTab") {
      initWritingTab();
      requestAnimationFrame(() => {
        if (writingCanvasInstance) writingCanvasInstance.resize();
      });
      setTimeout(() => {
        if (writingCanvasInstance) writingCanvasInstance.resize();
      }, 100);
    }
    if (tabId === "vocabTab") renderVocabSection();
    if (tabId === "flashcardTab") initFlashcards();
    if (tabId === "quizTab" && quizQuestions.length === 0) renderQuizSetup();
    if (tabId === "statsTab") renderStatsView();
    updateGlobalMetrics();
  }

  // Bind navigation clicks
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.getAttribute("data-nav");
      if (target) switchTab(target);
    });
  });

  // Global metrics update (in hero & header)
  function updateGlobalMetrics() {
    const metrics = Storage.getMetrics();
    if (streakDisplay) streakDisplay.textContent = metrics.streakDays + " Hari";

    if (heroProgressFill && heroProgressText) {
      const pct = metrics.totalAll > 0 ? Math.round((metrics.totalMastered / metrics.totalAll) * 100) : 0;
      heroProgressFill.style.transform = `scaleX(${pct / 100})`;
      heroProgressText.textContent = pct + "% (" + metrics.totalMastered + "/" + metrics.totalAll + ")";
    }

    if (heroHiraCount) heroHiraCount.textContent = metrics.hiraMastered + "/" + metrics.hiraTotal;
    if (heroKataCount) heroKataCount.textContent = metrics.kataMastered + "/" + metrics.kataTotal;
  }

  /* =========================================================
   * KANA EXPLORER & TABLES
   * ========================================================= */
  const scriptSegments = document.querySelectorAll("[data-script]");
  const filterChips = document.querySelectorAll("[data-filter]");
  const kanaSearchInput = document.getElementById("kanaSearchInput");
  const kanaCardsContainer = document.getElementById("kanaCardsContainer");
  const yoonFormulaContainer = document.getElementById("yoonFormulaContainer");
  const confusablesContainer = document.getElementById("confusablesContainer");
  const specialSectionContainer = document.getElementById("specialSectionContainer");

  // Script switch (Hiragana vs Katakana)
  scriptSegments.forEach(btn => {
    btn.addEventListener("click", () => {
      scriptSegments.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentScript = btn.getAttribute("data-script");
      renderKanaSection();
    });
  });

  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.getAttribute("data-filter");
      renderKanaSection();
    });
  });

  // Search input
  if (kanaSearchInput) {
    kanaSearchInput.addEventListener("input", e => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderKanaSection();
    });
  }

  function renderKanaSection() {
    if (!kanaCardsContainer) return;

    // Tampilkan / sembunyikan banner Yōon & Karakter Mirip berdasarkan filter
    if (currentFilter === "yoon") {
      yoonFormulaContainer.style.display = "block";
      renderYoonBanner();
    } else {
      yoonFormulaContainer.style.display = "none";
    }

    if (currentFilter === "confusables") {
      confusablesContainer.style.display = "block";
      kanaCardsContainer.style.display = "none";
      if (specialSectionContainer) specialSectionContainer.style.display = "none";
      renderConfusables();
      return;
    } else {
      confusablesContainer.style.display = "none";
      kanaCardsContainer.style.display = "grid";
    }

    if (currentFilter === "special") {
      if (specialSectionContainer) {
        specialSectionContainer.style.display = "block";
        renderSpecialCharacters();
      }
      kanaCardsContainer.style.display = "none";
      return;
    } else {
      if (specialSectionContainer) specialSectionContainer.style.display = "none";
    }

    // Ambil data karakter sesuai script
    let entries = KD.byScript(currentScript);

    // Terapkan kategori filter
    if (currentFilter === "basic") {
      entries = entries.filter(e => e.type === "basic");
    } else if (currentFilter === "dakuten") {
      entries = entries.filter(e => e.type === "dakuten" || e.type === "handakuten");
    } else if (currentFilter === "yoon") {
      entries = entries.filter(e => e.type === "yoon");
    }

    // Terapkan search query
    if (searchQuery) {
      entries = entries.filter(e => {
        return e.romaji.includes(searchQuery) ||
               e.kana.includes(searchQuery) ||
               e.altRomaji.some(alt => alt.includes(searchQuery));
      });
    }

    currentRenderedKanaList = entries;
    kanaCardsContainer.innerHTML = "";

    if (entries.length === 0) {
      kanaCardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
          Tidak ada karakter yang cocok dengan kata kunci "<strong>${escapeHtml(searchQuery)}</strong>".
        </div>
      `;
      return;
    }

    entries.forEach(entry => {
      const isM = Storage.isMastered(entry.id);
      const card = document.createElement("div");
      card.className = "kana-card" + (isM ? " mastered" : "") + (entry.type === "yoon" ? " is-yoon" : "");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `${entry.kana}, romaji ${entry.romaji}`);

      card.innerHTML = `
        <button class="kana-card-audio" title="Dengarkan pelafalan" aria-label="Dengarkan ${entry.kana}">
          🔊
        </button>
        <span class="kana-glyph">${entry.kana}</span>
        <span class="kana-romaji">${entry.romaji}</span>
      `;

      // Audio click
      const audioBtn = card.querySelector(".kana-card-audio");
      audioBtn.addEventListener("click", e => {
        e.stopPropagation();
        audioBtn.classList.add("is-speaking");
        Audio.speakKana(entry.kana, null, () => audioBtn.classList.remove("is-speaking"));
      });

      // Card modal click
      card.addEventListener("click", () => openCharacterModal(entry));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openCharacterModal(entry);
        }
      });

      kanaCardsContainer.appendChild(card);
    });
  }

  function renderYoonBanner() {
    if (!yoonFormulaContainer) return;
    const isH = currentScript === "hiragana";
    const baseSample = isH ? "き" : "キ";
    const smallSample = isH ? "ゃ" : "ャ";
    const resSample = isH ? "きゃ" : "キャ";

    yoonFormulaContainer.innerHTML = `
      <div class="yoon-formula-banner">
        <div class="yoon-equation">
          <div class="yoon-eq-unit">
            <span>${baseSample}</span>
            <span class="yoon-eq-sub">ki</span>
          </div>
          <span class="yoon-eq-op">+</span>
          <div class="yoon-eq-unit">
            <span>${smallSample}</span>
            <span class="yoon-eq-sub">ya (kecil)</span>
          </div>
          <span class="yoon-eq-op">=</span>
          <div class="yoon-eq-unit">
            <span style="color: var(--accent-red);">${resSample}</span>
            <span class="yoon-eq-sub" style="color: var(--accent-red); font-weight: 800;">kya</span>
          </div>
        </div>
        <div class="yoon-tip-text">
          <strong>Kaidah Yōon (Kombinasi):</strong> Gabungan huruf baris "i" (ki, shi, chi, ni, hi, mi, ri, gi, ji, bi, pi) dengan huruf ゃ/ゅ/ょ kecil. Dibaca <strong>satu ketukan penuh</strong>, bukan suku kata terpisah!
        </div>
      </div>
    `;
  }

  function renderConfusables() {
    if (!confusablesContainer) return;
    const pairs = KD.CONFUSABLES[currentScript] || [];
    confusablesContainer.innerHTML = "";

    const explanations = {
      "ぬ,め": "ぬ memiliki bulatan/simpul kecil di ujung kanan bawah; sedangkan め tidak bersimpul dan melengkung bebas.",
      "わ,れ,ね": "Ketiganya memiliki tiang vertikal kiri yang sama. わ melengkung terbuka ke kanan; れ memiliki ekor lancip mencuat; ね berakhir dengan simpul melingkar.",
      "さ,き": "さ hanya memiliki 1 garis horizontal melintang; sedangkan き memiliki 2 garis horizontal.",
      "は,ほ": "は tiang kirinya tidak memiliki topi garis atas; sedangkan ほ memiliki garis horizontal penutup di bagian atas.",
      "い,り": "い kedua goresannya lebih melengkung saling berhadapan; sedangkan り goresan kanannya jauh lebih panjang lurus ke bawah.",
      "る,ろ": "る memiliki simpul bulat tertutup di ujung ekor bawah; sedangkan ろ terbuka tanpa simpul.",
      "あ,お": "あ memiliki loop melintang di tengah; sedangkan お memiliki titik petik terpisah di kanan atas.",
      "ま,も": "ま memiliki 2 garis horizontal di atas tiang; sedangkan も tiang vertikalnya menembus melengkung dari atas seperti kait pancing.",
      "シ,ツ": "シ (Shi) goresannya mendatar dari kiri bawah ditarik ke kanan atas; sedangkan ツ (Tsu) goresannya lebih tegak dari atas ditarik ke bawah.",
      "ソ,ン": "ソ (So) goresan pertamanya dari atas ditarik miring ke bawah; sedangkan ン (N) goresan panjangnya meluncur mendatar dari bawah ke atas.",
      "ク,タ": "タ memiliki goresan horizontal ekstra di bagian dalam; sedangkan ク kosong.",
      "ウ,ワ": "ウ memiliki titik kepala vertikal di atas; sedangkan ワ rata tanpa titik kepala.",
      "コ,ユ": "コ memiliki dua sudut horizontal-vertikal; sedangkan ユ memiliki garis dasar melengkung menembus.",
      "ヌ,ス": "ヌ memiliki simpul silang di ujung bawah; sedangkan ス ujungnya bebas melengkung.",
      "ナ,メ": "ナ memiliki garis horizontal dan titik silang; sedangkan メ hanya silang dua goresan diagonal.",
      "ア,マ": "ア sudut kanannya terbuka ke bawah; sedangkan マ garisnya melintang kembali ke kiri bawah."
    };

    pairs.forEach(pair => {
      const card = document.createElement("div");
      card.className = "confusable-pair-card";

      const key = pair.join(",");
      const note = explanations[key] || "Perhatikan arah tarikan goresan dan ada tidaknya simpul/titik.";

      let glyphsHtml = pair.map(char => {
        const found = KD.KANA.find(e => e.kana === char && e.script === currentScript);
        const romaji = found ? found.romaji : "";
        return `
          <div class="confusable-item" data-id="${found ? found.id : ''}" title="Dengarkan ${char}">
            <span class="confusable-glyph">${char}</span>
            <span class="confusable-romaji">${romaji}</span>
          </div>
        `;
      }).join('<span class="confusable-vs">vs</span>');

      card.innerHTML = `
        <div class="confusable-glyphs">${glyphsHtml}</div>
        <div class="confusable-notes">${note}</div>
      `;

      card.querySelectorAll(".confusable-item").forEach(item => {
        item.addEventListener("click", () => {
          const char = item.querySelector(".confusable-glyph").textContent;
          Audio.speakKana(char);
          const id = item.getAttribute("data-id");
          const entry = KD.getById(id);
          if (entry) openCharacterModal(entry);
        });
      });

      confusablesContainer.appendChild(card);
    });
  }

  function renderSpecialCharacters() {
    if (!specialSectionContainer) return;
    specialSectionContainer.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 6px;">Karakter Khusus (Tsu Kecil & Vokal Panjang)</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Karakter ini tidak dibaca sebagai suku kata mandiri, melainkan mengubah ritme dan panjang ketukan kata.</p>
      </div>
    `;

    KD.SPECIAL.forEach(item => {
      const card = document.createElement("div");
      card.className = "special-card";
      card.innerHTML = `
        <div class="special-glyph-box">${item.kana}</div>
        <div class="special-info">
          <h4>${item.name} (${item.script.toUpperCase()})</h4>
          <p class="special-desc">${item.desc}</p>
          <div class="special-tip">💡 <strong>Tips:</strong> ${item.tip}</div>
        </div>
      `;
      specialSectionContainer.appendChild(card);
    });
  }

  /* =========================================================
   * CHARACTER MODAL / DRAWER
   * ========================================================= */
  const charModal = document.getElementById("charModal");
  const modalChar = document.getElementById("modalChar");
  const modalRomaji = document.getElementById("modalRomaji");
  const modalScriptType = document.getElementById("modalScriptType");
  const modalCharCounter = document.getElementById("modalCharCounter");
  const modalAudioBtn = document.getElementById("modalAudioBtn");
  const modalMasterToggleBtn = document.getElementById("modalMasterToggleBtn");
  const modalTipContent = document.getElementById("modalTipContent");
  const modalSimilarList = document.getElementById("modalSimilarList");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalPrevCharBtn = document.getElementById("modalPrevCharBtn");
  const modalNextCharBtn = document.getElementById("modalNextCharBtn");
  const startKanaTourBtn = document.getElementById("startKanaTourBtn");

  let activeModalEntry = null;

  function openCharacterModal(entry) {
    if (!entry || !charModal) return;
    activeModalEntry = entry;

    modalChar.textContent = entry.kana;
    modalRomaji.textContent = entry.romaji + (entry.altRomaji && entry.altRomaji.length > 0 ? " (alt: " + entry.altRomaji.join(", ") + ")" : "");
    modalScriptType.textContent = `${entry.script.toUpperCase()} • ${entry.type.toUpperCase()}`;

    // Navigasi berurutan huruf (Prev / Next)
    let navList = currentRenderedKanaList;
    if (!navList || navList.length === 0 || !navList.some(e => e.id === entry.id)) {
      navList = KD.byScript(entry.script);
    }

    const currentIndex = navList.findIndex(e => e.id === entry.id);

    if (modalCharCounter && currentIndex !== -1) {
      modalCharCounter.textContent = `Huruf ${currentIndex + 1} dari ${navList.length}`;
      modalCharCounter.style.display = "block";
    } else if (modalCharCounter) {
      modalCharCounter.style.display = "none";
    }

    if (modalPrevCharBtn) {
      modalPrevCharBtn.onclick = (e) => {
        e.stopPropagation();
        const prevIdx = (currentIndex - 1 + navList.length) % navList.length;
        openCharacterModal(navList[prevIdx]);
      };
    }

    if (modalNextCharBtn) {
      modalNextCharBtn.onclick = (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % navList.length;
        openCharacterModal(navList[nextIdx]);
      };
    }

    // Tips Indonesia
    const tip = KD.tipFor(entry);
    modalTipContent.textContent = tip || "Pelafalan standar bahasa Jepang. Ucapkan dengan lugas dan jelas.";

    // Update mastered toggle button
    updateModalMasterButton();

    // Similar characters chips
    modalSimilarList.innerHTML = "";
    if (entry.similarTo && entry.similarTo.length > 0) {
      entry.similarTo.forEach(simId => {
        const simEntry = KD.getById(simId);
        if (simEntry) {
          const chip = document.createElement("button");
          chip.className = "similar-chip";
          chip.textContent = `${simEntry.kana} (${simEntry.romaji})`;
          chip.addEventListener("click", () => openCharacterModal(simEntry));
          modalSimilarList.appendChild(chip);
        }
      });
      document.getElementById("modalSimilarSection").style.display = "block";
    } else {
      document.getElementById("modalSimilarSection").style.display = "none";
    }

    // Play pronunciation on open
    Audio.speakKana(entry.kana);

    charModal.classList.add("open");
    charModal.setAttribute("aria-hidden", "false");
  }

  function updateModalMasterButton() {
    if (!activeModalEntry || !modalMasterToggleBtn) return;
    const isM = Storage.isMastered(activeModalEntry.id);
    if (isM) {
      modalMasterToggleBtn.textContent = "✓ Sudah Dikuasai";
      modalMasterToggleBtn.className = "btn btn-secondary";
      modalMasterToggleBtn.style.color = "var(--accent-green)";
    } else {
      modalMasterToggleBtn.textContent = "+ Tandai Dikuasai";
      modalMasterToggleBtn.className = "btn btn-primary";
      modalMasterToggleBtn.style.color = "#fff";
    }
  }

  if (modalAudioBtn) {
    modalAudioBtn.addEventListener("click", () => {
      if (activeModalEntry) {
        modalAudioBtn.classList.add("is-speaking");
        Audio.speakKana(activeModalEntry.kana, () => modalAudioBtn.classList.add("is-speaking"), () => modalAudioBtn.classList.remove("is-speaking"));
      }
    });
  }

  if (modalMasterToggleBtn) {
    modalMasterToggleBtn.addEventListener("click", () => {
      if (activeModalEntry) {
        Storage.toggleMastered(activeModalEntry.id);
        updateModalMasterButton();
        renderKanaSection();
        updateGlobalMetrics();
      }
    });
  }

  const modalWritePracticeBtn = document.getElementById("modalWritePracticeBtn");
  if (modalWritePracticeBtn) {
    modalWritePracticeBtn.addEventListener("click", () => {
      if (activeModalEntry) {
        const targetEntry = activeModalEntry;
        closeModal();
        switchTab("writeTab");
        if (typeof window.selectWritingCharacterById === "function") {
          window.selectWritingCharacterById(targetEntry.id, targetEntry.script);
        }
      }
    });
  }

  function closeModal() {
    if (charModal) {
      charModal.classList.remove("open");
      charModal.setAttribute("aria-hidden", "true");
    }
    activeModalEntry = null;
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (charModal) {
    charModal.addEventListener("click", e => {
      if (e.target === charModal) closeModal();
    });
  }

  if (startKanaTourBtn) {
    startKanaTourBtn.addEventListener("click", () => {
      const list = (currentRenderedKanaList && currentRenderedKanaList.length > 0)
        ? currentRenderedKanaList
        : KD.byScript(currentScript);
      if (list && list.length > 0) {
        openCharacterModal(list[0]);
      }
    });
  }

  document.addEventListener("keydown", e => {
    if (charModal && charModal.classList.contains("open")) {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (modalNextCharBtn) modalNextCharBtn.click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (modalPrevCharBtn) modalPrevCharBtn.click();
      } else if (e.key === " " || e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (modalAudioBtn) modalAudioBtn.click();
      }
    }
  });

  /* =========================================================
   * FLASHCARD ENGINE
   * ========================================================= */
  const flashcardFlipper = document.getElementById("flashcardFlipper");
  const flashcardFrontChar = document.getElementById("flashcardFrontChar");
  const flashcardBackRomaji = document.getElementById("flashcardBackRomaji");
  const flashcardBackKana = document.getElementById("flashcardBackKana");
  const flashcardBackType = document.getElementById("flashcardBackType");
  const flashcardBackTip = document.getElementById("flashcardBackTip");
  const flashcardBackAudioBtn = document.getElementById("flashcardBackAudioBtn");
  const flashcardCounter = document.getElementById("flashcardCounter");
  const flashcardProgressBar = document.getElementById("flashcardProgressBar");
  const flashcardDeckBtns = document.querySelectorAll("[data-deck]");
  const btnFlashUnknown = document.getElementById("btnFlashUnknown");
  const btnFlashKnown = document.getElementById("btnFlashKnown");

  let activeDeckType = "hira-basic";

  flashcardDeckBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      flashcardDeckBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeDeckType = btn.getAttribute("data-deck");
      initFlashcards();
    });
  });

  function initFlashcards() {
    let pool = [];
    if (activeDeckType === "hira-basic") {
      pool = KD.byScript("hiragana", { type: "basic" });
    } else if (activeDeckType === "kata-basic") {
      pool = KD.byScript("katakana", { type: "basic" });
    } else if (activeDeckType === "dakuten") {
      pool = KD.KANA.filter(e => e.type === "dakuten" || e.type === "handakuten");
    } else if (activeDeckType === "yoon") {
      pool = KD.KANA.filter(e => e.type === "yoon");
    } else if (activeDeckType === "missed") {
      const metrics = Storage.getMetrics();
      pool = metrics.missedIds.map(id => KD.getById(id)).filter(Boolean);
      if (pool.length === 0) {
        alert("Hebat! Belum ada karakter yang perlu diulang (antrean salah kosong). Memuat Hiragana Dasar.");
        pool = KD.byScript("hiragana", { type: "basic" });
      }
    }

    flashcardDeck = KD.shuffle(pool);
    flashcardIndex = 0;
    isCardFlipped = false;
    renderCurrentFlashcard();
  }

  function renderCurrentFlashcard() {
    if (!flashcardFrontChar || flashcardDeck.length === 0) return;

    if (flashcardIndex >= flashcardDeck.length) {
      Audio.playSuccessFanfare();
      flashcardCounter.textContent = "Sesi Selesai!";
      flashcardFrontChar.textContent = "🎉";
      document.getElementById("flashcardFrontHint").textContent = "Anda telah menyelesaikan deck ini. Klik tombol di bawah untuk mengulang.";
      if (flashcardFlipper) flashcardFlipper.classList.remove("flipped");
      isCardFlipped = false;
      return;
    }

    const current = flashcardDeck[flashcardIndex];
    if (flashcardCounter) {
      flashcardCounter.textContent = `Kartu ${flashcardIndex + 1} dari ${flashcardDeck.length}`;
    }
    if (flashcardProgressBar) {
      const pct = Math.round(((flashcardIndex) / flashcardDeck.length) * 100);
      flashcardProgressBar.style.transform = `scaleX(${pct / 100})`;
    }

    // Reset flip
    if (flashcardFlipper) flashcardFlipper.classList.remove("flipped");
    isCardFlipped = false;

    flashcardFrontChar.textContent = current.kana;
    flashcardBackRomaji.textContent = current.romaji;
    flashcardBackKana.textContent = current.kana;
    flashcardBackType.textContent = `${current.script} • ${current.type}`;
    const tip = KD.tipFor(current);
    flashcardBackTip.textContent = tip ? "💡 " + tip : "Pelafalan standar bahasa Jepang.";
  }

  function toggleCardFlip() {
    if (flashcardIndex >= flashcardDeck.length) {
      initFlashcards();
      return;
    }
    isCardFlipped = !isCardFlipped;
    Audio.playCardFlipSound();
    if (flashcardFlipper) {
      flashcardFlipper.classList.toggle("flipped", isCardFlipped);
    }
    if (isCardFlipped && flashcardDeck[flashcardIndex]) {
      Audio.speakKana(flashcardDeck[flashcardIndex].kana);
    }
  }

  if (flashcardFlipper) {
    flashcardFlipper.addEventListener("click", toggleCardFlip);
  }

  if (flashcardBackAudioBtn) {
    flashcardBackAudioBtn.addEventListener("click", e => {
      e.stopPropagation();
      const current = flashcardDeck[flashcardIndex];
      if (current) Audio.speakKana(current.kana);
    });
  }

  if (btnFlashUnknown) {
    btnFlashUnknown.addEventListener("click", () => {
      if (flashcardIndex >= flashcardDeck.length) return;
      const current = flashcardDeck[flashcardIndex];
      Storage.markCardReview(current.id, false);
      flashcardIndex++;
      renderCurrentFlashcard();
      updateGlobalMetrics();
    });
  }

  if (btnFlashKnown) {
    btnFlashKnown.addEventListener("click", () => {
      if (flashcardIndex >= flashcardDeck.length) return;
      const current = flashcardDeck[flashcardIndex];
      Storage.markCardReview(current.id, true);
      flashcardIndex++;
      renderCurrentFlashcard();
      updateGlobalMetrics();
    });
  }

  // Keyboard shortcut Flashcards
  document.addEventListener("keydown", e => {
    const flashTab = document.getElementById("flashcardTab");
    if (!flashTab || !flashTab.classList.contains("active")) return;
    if (charModal && charModal.classList.contains("open")) return;

    if (e.code === "Space") {
      e.preventDefault();
      toggleCardFlip();
    } else if (e.key === "1") {
      e.preventDefault();
      if (btnFlashUnknown) btnFlashUnknown.click();
    } else if (e.key === "2") {
      e.preventDefault();
      if (btnFlashKnown) btnFlashKnown.click();
    } else if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      if (flashcardDeck[flashcardIndex]) Audio.speakKana(flashcardDeck[flashcardIndex].kana);
    }
  });

  /* =========================================================
   * QUIZ ENGINE
   * ========================================================= */
  const quizSetupCard = document.getElementById("quizSetupCard");
  const quizActiveCard = document.getElementById("quizActiveCard");
  const quizResultCard = document.getElementById("quizResultCard");
  const quizModeOptions = document.querySelectorAll(".quiz-mode-option");
  const quizScopeSelect = document.getElementById("quizScopeSelect");
  const startQuizBtn = document.getElementById("startQuizBtn");

  const quizProgressBar = document.getElementById("quizProgressBar");
  const quizProgressText = document.getElementById("quizProgressText");
  const quizPromptChar = document.getElementById("quizPromptChar");
  const quizPromptCategory = document.getElementById("quizPromptCategory");
  const quizOptionsGrid = document.getElementById("quizOptionsGrid");
  const quizTypingBox = document.getElementById("quizTypingBox");
  const quizTextInput = document.getElementById("quizTextInput");
  const quizSubmitTypeBtn = document.getElementById("quizSubmitTypeBtn");
  const quizFeedbackBanner = document.getElementById("quizFeedbackBanner");

  quizModeOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      quizModeOptions.forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      quizMode = opt.getAttribute("data-mode");
    });
  });

  function renderQuizSetup() {
    if (quizSetupCard) quizSetupCard.style.display = "block";
    if (quizActiveCard) quizActiveCard.style.display = "none";
    if (quizResultCard) quizResultCard.style.display = "none";
  }

  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      const scope = quizScopeSelect ? quizScopeSelect.value : "hira-basic";
      let pool = [];

      if (scope === "hira-basic") {
        pool = KD.byScript("hiragana", { type: "basic" });
      } else if (scope === "kata-basic") {
        pool = KD.byScript("katakana", { type: "basic" });
      } else if (scope === "dakuten") {
        pool = KD.KANA.filter(e => e.type === "dakuten" || e.type === "handakuten");
      } else if (scope === "yoon") {
        pool = KD.KANA.filter(e => e.type === "yoon");
      } else if (scope === "all-hiragana") {
        pool = KD.byScript("hiragana");
      } else if (scope === "all-katakana") {
        pool = KD.byScript("katakana");
      } else if (scope === "vocab-n5") {
        const vocabPool = (VD && VD.VOCAB) ? VD.VOCAB : [];
        const shuffledVocab = (VD ? VD.shuffle(vocabPool) : vocabPool.slice()).slice(0, 10);
        quizQuestions = shuffledVocab.map(entry => {
          return VD.buildVocabQuestion(entry, vocabPool);
        });

        currentQuizIndex = 0;
        quizScore = 0;
        quizMissed = [];

        if (quizSetupCard) quizSetupCard.style.display = "none";
        if (quizActiveCard) quizActiveCard.style.display = "block";
        if (quizResultCard) quizResultCard.style.display = "none";

        renderCurrentQuestion();
        return;
      } else if (scope === "missed") {
        const metrics = Storage.getMetrics();
        pool = metrics.missedIds.map(id => KD.getById(id)).filter(Boolean);
        if (pool.length === 0) {
          alert("Belum ada riwayat karakter salah. Mengambil soal Hiragana & Katakana umum.");
          pool = KD.KANA.filter(e => e.type === "basic");
        }
      }

      // Filter yang valid untuk quiz
      pool = pool.filter(e => e.quiz);
      if (quizMode === "romaji-to-kana") {
        pool = pool.filter(e => e.quizRomajiToKana);
      }

      const shuffledPool = KD.shuffle(pool).slice(0, 10);
      quizQuestions = shuffledPool.map(entry => {
        return KD.buildQuestion(entry, quizMode);
      });

      currentQuizIndex = 0;
      quizScore = 0;
      quizMissed = [];

      if (quizSetupCard) quizSetupCard.style.display = "none";
      if (quizActiveCard) quizActiveCard.style.display = "block";
      if (quizResultCard) quizResultCard.style.display = "none";

      renderCurrentQuestion();
    });
  }

  function renderCurrentQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
      finishQuiz();
      return;
    }

    const q = quizQuestions[currentQuizIndex];

    // Handle Vocab Question
    if (q.isVocab) {
      quizProgressText.textContent = `Soal ${currentQuizIndex + 1} / ${quizQuestions.length}`;
      quizProgressBar.style.transform = `scaleX(${currentQuizIndex / quizQuestions.length})`;

      quizPromptCategory.textContent = `KOSAKATA • ${q.script.toUpperCase()}`;
      quizPromptChar.textContent = q.prompt;
      quizPromptChar.className = "prompt-character";

      quizFeedbackBanner.className = "quiz-feedback-banner";
      quizFeedbackBanner.innerHTML = "";

      if (quizMode === "typing") {
        quizOptionsGrid.style.display = "none";
        quizTypingBox.style.display = "flex";
        quizTextInput.value = "";
        quizTextInput.placeholder = `Ketik romaji (contoh: ${q.word.romaji})...`;
        quizTextInput.disabled = false;
        quizSubmitTypeBtn.disabled = false;
        setTimeout(() => quizTextInput.focus(), 100);
      } else {
        quizOptionsGrid.style.display = "grid";
        quizTypingBox.style.display = "none";
        quizOptionsGrid.innerHTML = "";

        q.options.forEach(opt => {
          const btn = document.createElement("button");
          btn.className = "quiz-option-btn";
          btn.textContent = opt.label;
          btn.addEventListener("click", () => handleOptionSelect(btn, opt.id, q.answerId));
          quizOptionsGrid.appendChild(btn);
        });
      }

      Audio.speakKana(q.word.kana);
      return;
    }

    const entry = KD.getById(q.entryId);

    // Update progress
    quizProgressText.textContent = `Soal ${currentQuizIndex + 1} / ${quizQuestions.length}`;
    quizProgressBar.style.transform = `scaleX(${currentQuizIndex / quizQuestions.length})`;

    // Setup prompt
    quizPromptCategory.textContent = `${entry.script.toUpperCase()} • ${entry.type.toUpperCase()}`;
    quizPromptChar.textContent = q.prompt;

    if (q.mode === "romaji-to-kana") {
      quizPromptChar.className = "prompt-character romaji-prompt";
    } else {
      quizPromptChar.className = "prompt-character";
    }

    quizFeedbackBanner.className = "quiz-feedback-banner";
    quizFeedbackBanner.innerHTML = "";

    // Pilihan ganda vs Ketik
    if (q.mode === "typing") {
      quizOptionsGrid.style.display = "none";
      quizTypingBox.style.display = "flex";
      quizTextInput.value = "";
      quizTextInput.placeholder = "Ketik romaji (contoh: ka)...";
      quizTextInput.disabled = false;
      quizSubmitTypeBtn.disabled = false;
      setTimeout(() => quizTextInput.focus(), 100);
    } else {
      quizOptionsGrid.style.display = "grid";
      quizTypingBox.style.display = "none";
      quizOptionsGrid.innerHTML = "";

      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.textContent = opt.label;
        btn.addEventListener("click", () => handleOptionSelect(btn, opt.id, q.answerId));
        quizOptionsGrid.appendChild(btn);
      });
    }

    // Putar suara jika mode Kana -> Romaji
    if (q.mode === "kana-to-romaji") {
      Audio.speakKana(entry.kana);
    }
  }

  function handleOptionSelect(selectedBtn, chosenId, correctId) {
    const q = quizQuestions[currentQuizIndex];
    const isCorrect = chosenId === correctId;
    const allBtns = quizOptionsGrid.querySelectorAll(".quiz-option-btn");
    allBtns.forEach(b => b.disabled = true);

    processAnswerOutcome(isCorrect, correctId, selectedBtn);
  }

  function handleTypingSubmit() {
    const q = quizQuestions[currentQuizIndex];
    const typed = quizTextInput.value.trim().toLowerCase();
    if (!typed) return;

    quizTextInput.disabled = true;
    quizSubmitTypeBtn.disabled = true;

    if (q.isVocab) {
      const isCorrect = typed === q.word.romaji.toLowerCase();
      processAnswerOutcome(isCorrect, q.answerId);
      return;
    }

    const entry = KD.getById(q.entryId);
    const isCorrect = KD.matchRomaji(entry, typed);
    processAnswerOutcome(isCorrect, q.answerId);
  }

  if (quizSubmitTypeBtn) quizSubmitTypeBtn.addEventListener("click", handleTypingSubmit);
  if (quizTextInput) {
    quizTextInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTypingSubmit();
      }
    });
  }

  function processAnswerOutcome(isCorrect, correctId, selectedBtn) {
    const q = quizQuestions[currentQuizIndex];

    if (q.isVocab) {
      if (isCorrect) {
        quizScore++;
        Audio.playCorrectSound();
        if (selectedBtn) selectedBtn.classList.add("correct");

        quizFeedbackBanner.className = "quiz-feedback-banner show correct-fb";
        quizFeedbackBanner.innerHTML = `
          <strong>✓ Benar sekali!</strong> ${q.word.kana} (${q.word.romaji}) = <em>${q.word.meaning}</em>
        `;
      } else {
        Audio.playWrongSound();
        quizMissed.push({ id: q.word.id, kana: q.word.kana, romaji: q.word.romaji, isVocab: true });
        if (selectedBtn) selectedBtn.classList.add("wrong");

        if (quizOptionsGrid) {
          const btns = quizOptionsGrid.querySelectorAll(".quiz-option-btn");
          btns.forEach(b => {
            if (b.textContent.includes(q.word.meaning)) {
              b.classList.add("correct");
            }
          });
        }

        quizFeedbackBanner.className = "quiz-feedback-banner show wrong-fb";
        quizFeedbackBanner.innerHTML = `
          <strong>✗ Kurang tepat.</strong> Jawaban benar: <strong>${q.word.kana} (${q.word.romaji}) = ${q.word.meaning}</strong>.
          ${q.word.tip ? `<div style="margin-top: 4px; font-size: 0.85rem;">💡 ${q.word.tip}</div>` : ""}
        `;
      }

      setTimeout(() => {
        currentQuizIndex++;
        renderCurrentQuestion();
      }, isCorrect ? 1000 : 2200);
      return;
    }

    const entry = KD.getById(q.entryId);
    Storage.recordQuizAnswer(entry.id, isCorrect);

    if (isCorrect) {
      quizScore++;
      Audio.playCorrectSound();
      if (selectedBtn) selectedBtn.classList.add("correct");

      quizFeedbackBanner.className = "quiz-feedback-banner show correct-fb";
      quizFeedbackBanner.innerHTML = `
        <strong>✓ Benar sekali!</strong> ${entry.kana} = <em>${entry.romaji}</em>
      `;
    } else {
      Audio.playWrongSound();
      quizMissed.push(entry);
      if (selectedBtn) selectedBtn.classList.add("wrong");

      // Highlight correct button
      if (quizOptionsGrid) {
        const btns = quizOptionsGrid.querySelectorAll(".quiz-option-btn");
        btns.forEach(b => {
          if (b.textContent === (q.mode === "romaji-to-kana" ? entry.kana : entry.romaji)) {
            b.classList.add("correct");
          }
        });
      }

      const tip = KD.tipFor(entry);
      quizFeedbackBanner.className = "quiz-feedback-banner show wrong-fb";
      quizFeedbackBanner.innerHTML = `
        <strong>✗ Kurang tepat.</strong> Jawaban benar: <strong>${entry.kana} = ${entry.romaji}</strong>.
        ${tip ? `<div style="margin-top: 4px; font-size: 0.85rem;">💡 ${tip}</div>` : ""}
      `;
    }

    updateGlobalMetrics();

    // Auto lanjut ke soal berikutnya setelah delay singkat
    setTimeout(() => {
      currentQuizIndex++;
      renderCurrentQuestion();
    }, isCorrect ? 1000 : 2200);
  }

  function finishQuiz() {
    if (quizActiveCard) quizActiveCard.style.display = "none";
    if (quizResultCard) quizResultCard.style.display = "block";

    Audio.playSuccessFanfare();
    Storage.saveQuizSession(quizScore, quizQuestions.length, quizMode);

    const pct = Math.round((quizScore / quizQuestions.length) * 100);
    document.getElementById("quizResultScore").textContent = `${quizScore} / ${quizQuestions.length}`;
    document.getElementById("quizResultPct").textContent = `${pct}% Akurasi`;

    const summaryEl = document.getElementById("quizResultSummary");
    if (pct >= 80) {
      summaryEl.textContent = "Luar biasa! Refleks membaca Anda sudah sangat mantap dan cepat.";
    } else if (pct >= 50) {
      summaryEl.textContent = "Bagus! Terus latih kosakata dan karakter yang masih ragu.";
    } else {
      summaryEl.textContent = "Jangan menyerah! Buka kembali menu Kosakata dan Tabel untuk memperkuat latihan membaca.";
    }

    const missedSection = document.getElementById("quizResultMissedSection");
    const missedList = document.getElementById("quizResultMissedList");
    if (quizMissed.length > 0) {
      missedSection.style.display = "block";
      missedList.innerHTML = "";
      quizMissed.forEach(m => {
        const item = document.createElement("div");
        item.className = "similar-chip";
        item.textContent = `${m.kana} (${m.romaji})`;
        if (m.isVocab) {
          item.title = "Klik untuk dengarkan pelafalan";
          item.addEventListener("click", () => Audio.speakKana(m.kana));
        } else {
          item.addEventListener("click", () => openCharacterModal(m));
        }
        missedList.appendChild(item);
      });
    } else {
      missedSection.style.display = "none";
    }
  }

  const retryQuizBtn = document.getElementById("retryQuizBtn");
  const newQuizBtn = document.getElementById("newQuizBtn");

  if (retryQuizBtn) {
    retryQuizBtn.addEventListener("click", () => {
      if (startQuizBtn) startQuizBtn.click();
    });
  }

  if (newQuizBtn) {
    newQuizBtn.addEventListener("click", renderQuizSetup);
  }

  /* =========================================================
   * STATS & PROGRESS VIEW
   * ========================================================= */
  function renderStatsView() {
    const metrics = Storage.getMetrics();

    document.getElementById("statTotalMastered").textContent = metrics.totalMastered;
    document.getElementById("statTotalAll").textContent = metrics.totalAll;
    document.getElementById("statQuizAcc").textContent = metrics.quizAccuracy + "%";
    document.getElementById("statStreak").textContent = metrics.streakDays + " Hari";
    document.getElementById("statHiraMastered").textContent = `${metrics.hiraMastered} / ${metrics.hiraTotal}`;
    document.getElementById("statKataMastered").textContent = `${metrics.kataMastered} / ${metrics.kataTotal}`;
    document.getElementById("statYoonMastered").textContent = `${metrics.yoonMastered} / ${metrics.yoonTotal}`;

    // Render missed items list
    const missedGrid = document.getElementById("statMissedGrid");
    const missedEmptyNotice = document.getElementById("statMissedEmpty");
    if (missedGrid && missedEmptyNotice) {
      missedGrid.innerHTML = "";
      if (metrics.missedIds.length === 0) {
        missedEmptyNotice.style.display = "block";
      } else {
        missedEmptyNotice.style.display = "none";
        metrics.missedIds.forEach(id => {
          const entry = KD.getById(id);
          if (entry) {
            const card = document.createElement("div");
            card.className = "kana-card";
            card.innerHTML = `
              <span class="kana-glyph">${entry.kana}</span>
              <span class="kana-romaji">${entry.romaji}</span>
            `;
            card.addEventListener("click", () => openCharacterModal(entry));
            missedGrid.appendChild(card);
          }
        });
      }
    }

    // Render quiz history list
    const historyList = document.getElementById("quizHistoryList");
    if (historyList) {
      const state = Storage.getState();
      const history = state.quizStats.history || [];
      historyList.innerHTML = "";
      if (history.length === 0) {
        historyList.innerHTML = `<li style="color: var(--text-muted); font-size: 0.88rem;">Belum ada sesi kuis yang diselesaikan.</li>`;
      } else {
        history.forEach(item => {
          const li = document.createElement("li");
          li.style.padding = "8px 0";
          li.style.borderBottom = "1px solid var(--border-subtle)";
          li.style.display = "flex";
          li.style.justifyContent = "space-between";
          li.style.fontSize = "0.88rem";

          const dateStr = new Date(item.date).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
          });
          const pct = Math.round((item.score / item.total) * 100);

          li.innerHTML = `
            <span>${dateStr} (${item.mode})</span>
            <strong>${item.score}/${item.total} (${pct}%)</strong>
          `;
          historyList.appendChild(li);
        });
      }
    }
  }

  // Reset Progress Button
  const resetProgressBtn = document.getElementById("resetProgressBtn");
  if (resetProgressBtn) {
    resetProgressBtn.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin mereset seluruh progres belajar dan riwayat kuis? Tindakan ini tidak dapat dibatalkan.")) {
        Storage.resetAll();
        updateGlobalMetrics();
        renderStatsView();
        renderKanaSection();
        alert("Progres telah berhasil direset.");
      }
    });
  }

  // Theme toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      Storage.saveSetting("theme", newTheme);
      themeToggleBtn.textContent = newTheme === "dark" ? "☀️" : "🌙";
    });

    // Initialize theme from saved state
    const savedTheme = Storage.getState().settings.theme || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggleBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
  }

  /* =========================================================
   * KOSAKATA N5 (VOCABULARY DRILL & CATALOG CONTROLLER)
   * ========================================================= */
  const vocabGridContainer = document.getElementById("vocabGridContainer");
  const vocabEmptyNotice = document.getElementById("vocabEmptyNotice");
  const vocabCategoryChips = document.getElementById("vocabCategoryChips");
  const vocabSearchInput = document.getElementById("vocabSearchInput");
  const vocabToggleRomajiBtn = document.getElementById("vocabToggleRomajiBtn");
  const vocabToggleViewBtn = document.getElementById("vocabToggleViewBtn");
  const vocabScriptBtns = document.querySelectorAll("[data-vocab-script]");

  const vocabDrillStage = document.getElementById("vocabDrillStage");
  const vocabDrillCounter = document.getElementById("vocabDrillCounter");
  const vocabDrillBadge = document.getElementById("vocabDrillBadge");
  const vocabDrillKana = document.getElementById("vocabDrillKana");
  const vocabDrillAudioBtn = document.getElementById("vocabDrillAudioBtn");
  const vocabDrillRevealBox = document.getElementById("vocabDrillRevealBox");
  const vocabDrillRevealBtn = document.getElementById("vocabDrillRevealBtn");
  const vocabDrillRevealedContent = document.getElementById("vocabDrillRevealedContent");
  const vocabDrillRomaji = document.getElementById("vocabDrillRomaji");
  const vocabDrillMeaning = document.getElementById("vocabDrillMeaning");
  const vocabDrillTip = document.getElementById("vocabDrillTip");
  const vocabDrillPrevBtn = document.getElementById("vocabDrillPrevBtn");
  const vocabDrillNextBtn = document.getElementById("vocabDrillNextBtn");
  const vocabDrillShuffleBtn = document.getElementById("vocabDrillShuffleBtn");
  const ctaVocabBtn = document.getElementById("ctaVocabBtn");

  function renderVocabSection() {
    if (!VD) return;

    // Render category chips jika belum dirender
    if (vocabCategoryChips && vocabCategoryChips.children.length === 0) {
      VD.CATEGORIES.forEach(cat => {
        const chip = document.createElement("button");
        chip.className = `chip ${cat.id === currentVocabCategory ? "active" : ""}`;
        chip.textContent = cat.label;
        chip.setAttribute("data-vocab-cat", cat.id);
        chip.addEventListener("click", () => {
          vocabCategoryChips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          currentVocabCategory = cat.id;
          vocabDrillIndex = 0;
          renderVocabList();
        });
        vocabCategoryChips.appendChild(chip);
      });
    }

    renderVocabList();
  }

  function renderVocabList() {
    if (!vocabGridContainer || !VD) return;

    const items = VD.filterVocab({
      script: currentVocabScript,
      category: currentVocabCategory,
      query: vocabSearchQuery
    });

    vocabDrillList = items;
    if (vocabDrillIndex >= vocabDrillList.length) {
      vocabDrillIndex = 0;
    }

    // Tampilan Drill (Kartu Tunggal)
    if (isVocabDrillActive) {
      vocabGridContainer.style.display = "none";
      if (items.length === 0) {
        if (vocabDrillStage) vocabDrillStage.style.display = "none";
        if (vocabEmptyNotice) vocabEmptyNotice.style.display = "block";
      } else {
        if (vocabEmptyNotice) vocabEmptyNotice.style.display = "none";
        if (vocabDrillStage) {
          vocabDrillStage.style.display = "flex";
          renderVocabDrillCard();
        }
      }
      return;
    }

    // Tampilan Grid (Katalog)
    if (vocabDrillStage) vocabDrillStage.style.display = "none";

    if (items.length === 0) {
      vocabGridContainer.style.display = "none";
      if (vocabEmptyNotice) vocabEmptyNotice.style.display = "block";
      return;
    }

    if (vocabEmptyNotice) vocabEmptyNotice.style.display = "none";
    vocabGridContainer.style.display = "grid";
    vocabGridContainer.innerHTML = "";

    const frag = document.createDocumentFragment();
    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "vocab-card";

      const catObj = VD.CATEGORIES.find(c => c.id === item.category);
      const catLabel = catObj ? catObj.label : item.category;

      card.innerHTML = `
        <div class="vocab-card-header">
          <span class="vocab-script-badge ${item.script}">${item.script}</span>
          <span class="vocab-category-tag">${escapeHtml(catLabel)}</span>
        </div>
        <div class="vocab-main-row">
          <div class="vocab-kana-text">${escapeHtml(item.kana)}</div>
          <button class="vocab-play-btn" aria-label="Putar suara ${escapeHtml(item.kana)}" title="Dengarkan Pelafalan">
            🔊
          </button>
        </div>
        <div class="vocab-reading-row">
          <span class="vocab-romaji-pill ${isVocabRomajiHidden ? "is-masked" : ""}" title="${isVocabRomajiHidden ? "Klik untuk mengintip romaji" : "Pelafalan romaji"}">
            ${escapeHtml(item.romaji)}
          </span>
        </div>
        <div class="vocab-meaning-text">${escapeHtml(item.meaning)}</div>
        ${item.tip ? `<div class="vocab-tip-text">💡 ${escapeHtml(item.tip)}</div>` : ""}
      `;

      const playBtn = card.querySelector(".vocab-play-btn");
      if (playBtn) {
        playBtn.addEventListener("click", e => {
          e.stopPropagation();
          playBtn.classList.add("is-speaking");
          Audio.speakKana(item.kana, () => playBtn.classList.add("is-speaking"), () => playBtn.classList.remove("is-speaking"));
        });
      }

      // Klik kartu langsung memutar pelafalan audio
      card.addEventListener("click", e => {
        if (e.target.closest(".vocab-romaji-pill") || e.target.closest(".vocab-play-btn")) return;
        if (playBtn) playBtn.classList.add("is-speaking");
        Audio.speakKana(item.kana, () => {
          if (playBtn) playBtn.classList.add("is-speaking");
        }, () => {
          if (playBtn) playBtn.classList.remove("is-speaking");
        });
      });

      const romajiPill = card.querySelector(".vocab-romaji-pill");
      if (romajiPill) {
        romajiPill.addEventListener("click", e => {
          if (isVocabRomajiHidden) {
            e.stopPropagation();
            romajiPill.classList.toggle("is-masked");
          }
        });
      }

      frag.appendChild(card);
    });

    vocabGridContainer.appendChild(frag);
  }

  function renderVocabDrillCard() {
    if (!vocabDrillList || vocabDrillList.length === 0) return;
    const item = vocabDrillList[vocabDrillIndex];
    if (!item) return;

    if (vocabDrillCounter) {
      vocabDrillCounter.textContent = `Kata ${vocabDrillIndex + 1} dari ${vocabDrillList.length}`;
    }

    if (vocabDrillBadge) {
      const catObj = VD.CATEGORIES.find(c => c.id === item.category);
      const catLabel = catObj ? catObj.label : item.category;
      vocabDrillBadge.className = `vocab-script-badge ${item.script}`;
      vocabDrillBadge.textContent = `${item.script.toUpperCase()} • ${catLabel.toUpperCase()}`;
    }

    if (vocabDrillKana) {
      vocabDrillKana.textContent = item.kana;
    }

    if (vocabDrillRevealedContent) {
      vocabDrillRevealedContent.style.display = "none";
    }
    if (vocabDrillRevealBtn) {
      vocabDrillRevealBtn.style.display = "block";
    }

    if (vocabDrillRomaji) vocabDrillRomaji.textContent = item.romaji;
    if (vocabDrillMeaning) vocabDrillMeaning.textContent = item.meaning;

    if (vocabDrillTip) {
      if (item.tip) {
        vocabDrillTip.style.display = "block";
        vocabDrillTip.textContent = "💡 " + item.tip;
      } else {
        vocabDrillTip.style.display = "none";
      }
    }

    if (vocabDrillKana) {
      vocabDrillKana.style.cursor = "pointer";
      vocabDrillKana.title = "Klik untuk dengarkan pelafalan";
      vocabDrillKana.onclick = () => {
        if (vocabDrillAudioBtn) vocabDrillAudioBtn.classList.add("is-speaking");
        Audio.speakKana(item.kana, () => {
          if (vocabDrillAudioBtn) vocabDrillAudioBtn.classList.add("is-speaking");
        }, () => {
          if (vocabDrillAudioBtn) vocabDrillAudioBtn.classList.remove("is-speaking");
        });
      };
    }

    if (vocabDrillAudioBtn) {
      vocabDrillAudioBtn.onclick = () => {
        vocabDrillAudioBtn.classList.add("is-speaking");
        Audio.speakKana(item.kana, () => vocabDrillAudioBtn.classList.add("is-speaking"), () => vocabDrillAudioBtn.classList.remove("is-speaking"));
      };
    }
  }

  // Vocab Listeners
  if (vocabScriptBtns.length > 0) {
    vocabScriptBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        vocabScriptBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentVocabScript = btn.getAttribute("data-vocab-script");
        vocabDrillIndex = 0;
        renderVocabList();
      });
    });
  }

  if (vocabSearchInput) {
    vocabSearchInput.addEventListener("input", e => {
      vocabSearchQuery = e.target.value;
      vocabDrillIndex = 0;
      renderVocabList();
    });
  }

  if (vocabToggleRomajiBtn) {
    vocabToggleRomajiBtn.addEventListener("click", () => {
      isVocabRomajiHidden = !isVocabRomajiHidden;
      vocabToggleRomajiBtn.textContent = isVocabRomajiHidden
        ? "👁️ Romaji: Sembunyi (Uji Baca)"
        : "👁️ Romaji: Tampil";
      vocabToggleRomajiBtn.classList.toggle("active", isVocabRomajiHidden);
      renderVocabList();
    });
  }

  if (vocabToggleViewBtn) {
    vocabToggleViewBtn.addEventListener("click", () => {
      isVocabDrillActive = !isVocabDrillActive;
      vocabToggleViewBtn.textContent = isVocabDrillActive
        ? "📋 Tampilkan Semua (Katalog)"
        : "⚡ Mode Latihan Kilat";
      vocabToggleViewBtn.classList.toggle("active", isVocabDrillActive);
      renderVocabList();
    });
  }

  if (vocabDrillRevealBtn) {
    vocabDrillRevealBtn.addEventListener("click", () => {
      vocabDrillRevealBtn.style.display = "none";
      if (vocabDrillRevealedContent) vocabDrillRevealedContent.style.display = "block";
      const item = vocabDrillList[vocabDrillIndex];
      if (item) Audio.speakKana(item.kana);
    });
  }

  if (vocabDrillNextBtn) {
    vocabDrillNextBtn.addEventListener("click", () => {
      if (vocabDrillIndex < vocabDrillList.length - 1) {
        vocabDrillIndex++;
      } else {
        vocabDrillIndex = 0;
      }
      renderVocabDrillCard();
    });
  }

  if (vocabDrillPrevBtn) {
    vocabDrillPrevBtn.addEventListener("click", () => {
      if (vocabDrillIndex > 0) {
        vocabDrillIndex--;
      } else {
        vocabDrillIndex = Math.max(0, vocabDrillList.length - 1);
      }
      renderVocabDrillCard();
    });
  }

  if (vocabDrillShuffleBtn) {
    vocabDrillShuffleBtn.addEventListener("click", () => {
      vocabDrillList = VD.shuffle(vocabDrillList);
      vocabDrillIndex = 0;
      renderVocabDrillCard();
    });
  }

  // Quick Action Buttons on Home
  const heroStartBtn = document.getElementById("heroStartBtn");
  const heroQuizBtn = document.getElementById("heroQuizBtn");
  const ctaYoonBtn = document.getElementById("ctaYoonBtn");
  const ctaConfusableBtn = document.getElementById("ctaConfusableBtn");

  if (ctaVocabBtn) {
    ctaVocabBtn.addEventListener("click", () => switchTab("vocabTab"));
  }

  const ctaWriteBtn = document.getElementById("ctaWriteBtn");
  if (ctaWriteBtn) {
    ctaWriteBtn.addEventListener("click", () => switchTab("writeTab"));
  }

  /* =========================================================
   * 15. KANVAS LATIHAN MENULIS (writeTab Controller)
   * ========================================================= */
  let writingCanvasInstance = null;
  let writeCurrentScript = "hiragana";
  let writeCurrentGroup = "all";
  let writeActiveChar = null;
  let writeCurrentIndex = 0;
  let writePool = [];

  function getWritingPool() {
    const data = (window.KanaWritingData && window.KanaWritingData[writeCurrentScript]) || [];
    if (writeCurrentGroup === "all") return data;
    return data.filter(c => c.group === writeCurrentGroup);
  }

  function renderWritingCharChips() {
    const container = document.getElementById("writeCharChipsContainer");
    if (!container) return;
    container.innerHTML = "";

    const pool = getWritingPool();
    writePool = pool;

    pool.forEach((item, idx) => {
      const btn = document.createElement("button");
      btn.className = "char-chip-btn" +
        (writeActiveChar && writeActiveChar.id === item.id ? " active" : "") +
        (Storage.isMastered(item.id) ? " mastered" : "");
      btn.title = `${item.char} (${item.romaji}) - ${item.strokes} goresan`;

      btn.innerHTML = `
        <span class="chip-kana">${item.char}</span>
        <span class="chip-romaji">${item.romaji}</span>
      `;

      btn.addEventListener("click", () => {
        writeCurrentIndex = idx;
        loadWritingCharacter(item);
      });

      container.appendChild(btn);
    });
  }

  function loadWritingCharacter(charItem) {
    if (!charItem) return;
    writeActiveChar = charItem;

    // Update Header Meta
    const glyphEl = document.getElementById("writeCharGlyph");
    const romajiEl = document.getElementById("writeCharRomaji");
    const strokesEl = document.getElementById("writeCharStrokes");
    const tipEl = document.getElementById("writeCharTip");
    const vocabJpEl = document.getElementById("writeVocabJp");
    const vocabRomEl = document.getElementById("writeVocabRom");
    const vocabIdEl = document.getElementById("writeVocabId");
    const masterBtn = document.getElementById("writeMasterToggleBtn");
    const accuracyCard = document.getElementById("accuracyResultCard");

    if (glyphEl) glyphEl.textContent = charItem.char;
    if (romajiEl) romajiEl.textContent = charItem.romaji;
    if (strokesEl) strokesEl.textContent = `${charItem.strokes} Goresan Resmi`;
    if (tipEl) tipEl.textContent = charItem.tip || "Latih tarikan garis seimbang di tengah kuadran kotak.";

    if (charItem.vocab) {
      if (vocabJpEl) vocabJpEl.textContent = charItem.vocab.jp;
      if (vocabRomEl) vocabRomEl.textContent = `(${charItem.vocab.rom})`;
      if (vocabIdEl) vocabIdEl.textContent = charItem.vocab.id;
    }

    // Update Mastered Toggle
    if (masterBtn) {
      const isM = Storage.isMastered(charItem.id);
      masterBtn.textContent = isM ? "✓ Sudah Dikuasai" : "+ Tandai Dikuasai";
      masterBtn.className = isM ? "btn btn-secondary" : "btn btn-primary";
      if (isM) masterBtn.style.color = "var(--accent-green)";
      else masterBtn.style.color = "#ffffff";
    }

    // Sembunyikan hasil akurasi huruf sebelumnya
    if (accuracyCard) accuracyCard.style.display = "none";

    // Render Langkah-Langkah Goresan
    const stepsContainer = document.getElementById("writeStrokeStepsContainer");
    if (stepsContainer) {
      stepsContainer.innerHTML = "";
      if (charItem.steps && charItem.steps.length > 0) {
        charItem.steps.forEach((step, sIdx) => {
          const row = document.createElement("div");
          row.className = "stroke-step-row";
          row.innerHTML = `
            <div class="stroke-num-badge">${sIdx + 1}</div>
            <div style="flex: 1;">
              <strong>Goresan ke-${sIdx + 1}:</strong> ${escapeHtml(step)}
            </div>
          `;
          stepsContainer.appendChild(row);
        });
      }
    }

    // Set Karakter ke Kanvas
    if (writingCanvasInstance) {
      writingCanvasInstance.setCharacter(charItem, writeCurrentScript);
    }

    // Update active state di carousel chips
    renderWritingCharChips();
  }

  function initWritingTab() {
    const canvasEl = document.getElementById("writingCanvas");
    const wrapperEl = document.getElementById("canvasWrapper");

    if (!canvasEl || !wrapperEl) return;

    if (!writingCanvasInstance && window.KanaWritingCanvas) {
      writingCanvasInstance = new window.KanaWritingCanvas({
        canvas: canvasEl,
        container: wrapperEl
      });

      // Bind Canvas Toolbar Buttons
      const brushBtn = document.getElementById("toolBrushBtn");
      const eraserBtn = document.getElementById("toolEraserBtn");
      const undoBtn = document.getElementById("writeUndoBtn");
      const clearBtn = document.getElementById("writeClearBtn");
      const ghostCb = document.getElementById("toggleGhostCheckbox");
      const gridCb = document.getElementById("toggleGridCheckbox");
      const audioBtn = document.getElementById("writeAudioBtn");
      const masterBtn = document.getElementById("writeMasterToggleBtn");
      const evalBtn = document.getElementById("writeEvaluateBtn");
      const prevBtn = document.getElementById("writePrevCharBtn");
      const nextBtn = document.getElementById("writeNextCharBtn");

      if (brushBtn && eraserBtn) {
        brushBtn.addEventListener("click", () => {
          writingCanvasInstance.setEraser(false);
          brushBtn.classList.add("active");
          eraserBtn.classList.remove("active");
        });

        eraserBtn.addEventListener("click", () => {
          writingCanvasInstance.setEraser(true);
          eraserBtn.classList.add("active");
          brushBtn.classList.remove("active");
        });
      }

      // Color swatches
      const colorBtns = document.querySelectorAll(".color-swatch-btn");
      colorBtns.forEach(cBtn => {
        cBtn.addEventListener("click", () => {
          colorBtns.forEach(b => b.classList.remove("active"));
          cBtn.classList.add("active");
          writingCanvasInstance.setBrushColor(cBtn.getAttribute("data-color"));
          if (brushBtn) brushBtn.classList.add("active");
          if (eraserBtn) eraserBtn.classList.remove("active");
        });
      });

      if (undoBtn) {
        undoBtn.addEventListener("click", () => writingCanvasInstance.undo());
      }
      if (clearBtn) {
        clearBtn.addEventListener("click", () => writingCanvasInstance.clearStrokes());
      }

      if (ghostCb) {
        ghostCb.addEventListener("change", e => {
          writingCanvasInstance.toggleGhost(e.target.checked);
        });
      }

      if (gridCb) {
        gridCb.addEventListener("change", e => {
          writingCanvasInstance.toggleGrid(e.target.checked);
        });
      }

      if (audioBtn) {
        audioBtn.addEventListener("click", () => {
          if (writeActiveChar) {
            audioBtn.classList.add("is-speaking");
            Audio.speakKana(writeActiveChar.char, () => audioBtn.classList.add("is-speaking"), () => audioBtn.classList.remove("is-speaking"));
          }
        });
      }

      if (masterBtn) {
        masterBtn.addEventListener("click", () => {
          if (!writeActiveChar) return;
          Storage.toggleMastered(writeActiveChar.id);
          const isM = Storage.isMastered(writeActiveChar.id);
          masterBtn.textContent = isM ? "✓ Sudah Dikuasai" : "+ Tandai Dikuasai";
          masterBtn.className = isM ? "btn btn-secondary" : "btn btn-primary";
          if (isM) masterBtn.style.color = "var(--accent-green)";
          else masterBtn.style.color = "#ffffff";
          renderWritingCharChips();
          updateGlobalMetrics();
        });
      }

      // Evaluasi Akurasi
      if (evalBtn) {
        evalBtn.addEventListener("click", () => {
          if (!writingCanvasInstance) return;
          const res = writingCanvasInstance.evaluateAccuracy();
          const card = document.getElementById("accuracyResultCard");
          const scoreBadge = document.getElementById("accuracyScoreBadge");
          const fillBar = document.getElementById("accuracyMeterFill");
          const gradeText = document.getElementById("accuracyGradeText");
          const feedbackText = document.getElementById("accuracyFeedbackText");

          if (!card) return;
          card.style.display = "block";
          if (scoreBadge) scoreBadge.textContent = `${res.score}%`;
          if (fillBar) fillBar.style.width = `${res.score}%`;
          if (gradeText) gradeText.textContent = res.grade || "Periksa Tulisan";
          if (feedbackText) feedbackText.textContent = res.feedback;

          if (res.score >= 80 && writeActiveChar) {
            // Tandai belajar di storage
            if (!Storage.isMastered(writeActiveChar.id)) {
              Storage.markCardReview(writeActiveChar.id, true);
              updateGlobalMetrics();
            }
          }
        });
      }

      // Navigasi Prev / Next
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          const pool = getWritingPool();
          if (pool.length === 0) return;
          writeCurrentIndex = (writeCurrentIndex - 1 + pool.length) % pool.length;
          loadWritingCharacter(pool[writeCurrentIndex]);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          const pool = getWritingPool();
          if (pool.length === 0) return;
          writeCurrentIndex = (writeCurrentIndex + 1) % pool.length;
          loadWritingCharacter(pool[writeCurrentIndex]);
        });
      }

      // Script Segmented Toggle
      const scriptHiraBtn = document.getElementById("writeScriptHiraBtn");
      const scriptKataBtn = document.getElementById("writeScriptKataBtn");

      if (scriptHiraBtn && scriptKataBtn) {
        scriptHiraBtn.addEventListener("click", () => {
          writeCurrentScript = "hiragana";
          scriptHiraBtn.classList.add("active");
          scriptKataBtn.classList.remove("active");
          writeCurrentIndex = 0;
          const pool = getWritingPool();
          loadWritingCharacter(pool[0]);
        });

        scriptKataBtn.addEventListener("click", () => {
          writeCurrentScript = "katakana";
          scriptKataBtn.classList.add("active");
          scriptHiraBtn.classList.remove("active");
          writeCurrentIndex = 0;
          const pool = getWritingPool();
          loadWritingCharacter(pool[0]);
        });
      }

      // Group Chips Toggle
      const groupChips = document.querySelectorAll("[data-write-group]");
      groupChips.forEach(chip => {
        chip.addEventListener("click", () => {
          groupChips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          writeCurrentGroup = chip.getAttribute("data-write-group");
          writeCurrentIndex = 0;
          const pool = getWritingPool();
          if (pool.length > 0) {
            loadWritingCharacter(pool[0]);
          }
        });
      });

      // License Modal Handlers
      const licBtn = document.getElementById("writeLicenseInfoBtn");
      const licModal = document.getElementById("writeLicenseModal");
      const licCloseBtn = document.getElementById("writeLicenseCloseBtn");
      const activateBtn = document.getElementById("activateLicenseBtn");
      const licInput = document.getElementById("licenseCodeInput");
      const licFeedback = document.getElementById("licenseFeedbackMsg");
      const licStatusText = document.getElementById("licenseStatusText");

      if (licBtn && licModal) {
        licBtn.addEventListener("click", () => {
          licModal.classList.add("open");
          licModal.setAttribute("aria-hidden", "false");
          if (licInput) licInput.value = "";
          if (licFeedback) licFeedback.style.display = "none";
          if (window.KanaAccess && licStatusText) {
            const isUnl = window.KanaAccess.isUnlocked();
            licStatusText.textContent = isUnl ? "✓ AKTIF (GRATIS / PROMO)" : "TERKUNCI";
          }
        });
      }

      function closeLicenseModal() {
        if (licModal) {
          licModal.classList.remove("open");
          licModal.setAttribute("aria-hidden", "true");
        }
      }

      if (licCloseBtn) licCloseBtn.addEventListener("click", closeLicenseModal);
      if (licModal) {
        licModal.addEventListener("click", e => {
          if (e.target === licModal) closeLicenseModal();
        });
      }

      if (activateBtn && licInput && window.KanaAccess) {
        activateBtn.addEventListener("click", () => {
          const val = licInput.value.trim();
          const res = window.KanaAccess.activateWithCode(val);
          if (licFeedback) {
            licFeedback.style.display = "block";
            licFeedback.style.color = res.success ? "var(--accent-green)" : "var(--accent-red)";
            licFeedback.textContent = res.message;
          }
          if (res.success && licStatusText) {
            licStatusText.textContent = "✓ LISENSI PRO AKTIF";
            licStatusText.style.color = "var(--accent-green)";
          }
        });
      }
    }

    // Muat Karakter Awal jika belum ada
    if (!writeActiveChar) {
      const pool = getWritingPool();
      if (pool.length > 0) {
        loadWritingCharacter(pool[0]);
      }
    } else {
      loadWritingCharacter(writeActiveChar);
    }

    if (writingCanvasInstance) {
      writingCanvasInstance.resize();
    }
  }

  // Helper agar dipanggil dari modal atau bagian lain
  window.selectWritingCharacterById = function (charId, script) {
    if (script && (script === "hiragana" || script === "katakana")) {
      writeCurrentScript = script;
      const scriptHiraBtn = document.getElementById("writeScriptHiraBtn");
      const scriptKataBtn = document.getElementById("writeScriptKataBtn");
      if (scriptHiraBtn && scriptKataBtn) {
        if (script === "hiragana") {
          scriptHiraBtn.classList.add("active");
          scriptKataBtn.classList.remove("active");
        } else {
          scriptKataBtn.classList.add("active");
          scriptHiraBtn.classList.remove("active");
        }
      }
    }

    initWritingTab();

    const data = (window.KanaWritingData && window.KanaWritingData[writeCurrentScript]) || [];
    const found = data.find(c => c.id === charId || c.char === charId);
    if (found) {
      writeCurrentGroup = found.group || "all";
      const groupChips = document.querySelectorAll("[data-write-group]");
      groupChips.forEach(chip => {
        if (chip.getAttribute("data-write-group") === writeCurrentGroup) {
          chip.classList.add("active");
        } else {
          chip.classList.remove("active");
        }
      });

      const pool = getWritingPool();
      writeCurrentIndex = pool.findIndex(c => c.id === found.id);
      if (writeCurrentIndex < 0) writeCurrentIndex = 0;
      loadWritingCharacter(found);
    }
  };

  // Deteksi URL redirect lisensi pembelian otomatis
  if (window.KanaAccess) {
    const actRes = window.KanaAccess.checkUrlActivation();
    if (actRes && actRes.triggered) {
      setTimeout(() => {
        switchTab("writeTab");
        alert(actRes.message);
      }, 350);
    }
  }

  // Handle URL hash navigation
  if (window.location.hash) {
    const rawHash = window.location.hash.replace("#", "");
    if (rawHash === "write" || rawHash === "writeTab") {
      switchTab("writeTab");
    }
  }


  if (heroStartBtn) {
    heroStartBtn.addEventListener("click", () => switchTab("learnTab"));
  }
  if (heroQuizBtn) {
    heroQuizBtn.addEventListener("click", () => switchTab("quizTab"));
  }
  if (ctaYoonBtn) {
    ctaYoonBtn.addEventListener("click", () => {
      switchTab("learnTab");
      const chipYoon = document.querySelector('[data-filter="yoon"]');
      if (chipYoon) chipYoon.click();
    });
  }
  if (ctaConfusableBtn) {
    ctaConfusableBtn.addEventListener("click", () => {
      switchTab("learnTab");
      const chipConf = document.querySelector('[data-filter="confusables"]');
      if (chipConf) chipConf.click();
    });
  }

  // Helper sanitasi HTML
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial load
  updateGlobalMetrics();
  renderKanaSection();
})();
