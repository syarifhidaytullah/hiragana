/* =========================================================
 * storage.js — KanaLearn LocalStorage State Manager
 * Mengelola progres belajar, status hafalan, statistik kuis, dan review
 * ========================================================= */
(function (root) {
  "use strict";

  const STORAGE_KEY = "kanalearn_progress_v1";

  const defaultState = {
    version: 1,
    learned: {},       // { [kanaId]: { status: 'mastered'|'learning', reviews: 0, lastSeen: timestamp } }
    missed: {},        // { [kanaId]: count }
    quizStats: {
      totalQuestions: 0,
      totalCorrect: 0,
      streak: 0,
      bestStreak: 0,
      history: []      // { date: ISOString, score: number, total: number, mode: string }
    },
    settings: {
      theme: "light",
      soundFx: true,
      ttsRate: 0.85,
      activeScript: "hiragana"
    },
    streakDays: {
      current: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10)
    }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultState));
      const parsed = JSON.parse(raw);
      // Merge with defaults in case of missing keys
      return Object.assign({}, defaultState, parsed, {
        quizStats: Object.assign({}, defaultState.quizStats, parsed.quizStats || {}),
        settings: Object.assign({}, defaultState.settings, parsed.settings || {}),
        streakDays: Object.assign({}, defaultState.streakDays, parsed.streakDays || {})
      });
    } catch (e) {
      console.warn("Gagal memuat localStorage, fallback ke default:", e);
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Gagal menyimpan progress ke localStorage:", e);
    }
  }

  let state = loadState();

  // Update streak days jika hari berganti
  (function updateDailyStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const last = state.streakDays.lastActiveDate;
    if (last !== today) {
      const lastDate = new Date(last);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        state.streakDays.current += 1;
      } else if (diffDays > 1) {
        state.streakDays.current = 1;
      }
      state.streakDays.lastActiveDate = today;
      saveState(state);
    }
  })();

  const Storage = {
    getState: function () {
      return state;
    },

    isMastered: function (id) {
      return state.learned[id] && state.learned[id].status === "mastered";
    },

    isLearning: function (id) {
      return state.learned[id] && state.learned[id].status === "learning";
    },

    toggleMastered: function (id) {
      if (Storage.isMastered(id)) {
        delete state.learned[id];
      } else {
        state.learned[id] = {
          status: "mastered",
          reviews: (state.learned[id]?.reviews || 0) + 1,
          lastSeen: Date.now()
        };
        // Hapus dari missed jika sudah dikuasai
        delete state.missed[id];
      }
      saveState(state);
      return Storage.isMastered(id);
    },

    markCardReview: function (id, remembered) {
      if (!state.learned[id]) {
        state.learned[id] = { status: "learning", reviews: 0, lastSeen: Date.now() };
      }
      state.learned[id].reviews += 1;
      state.learned[id].lastSeen = Date.now();

      if (remembered) {
        state.learned[id].status = "mastered";
        if (state.missed[id]) {
          state.missed[id] = Math.max(0, state.missed[id] - 1);
          if (state.missed[id] === 0) delete state.missed[id];
        }
      } else {
        state.learned[id].status = "learning";
        state.missed[id] = (state.missed[id] || 0) + 1;
      }
      saveState(state);
    },

    recordQuizAnswer: function (id, isCorrect) {
      state.quizStats.totalQuestions += 1;
      if (isCorrect) {
        state.quizStats.totalCorrect += 1;
        state.quizStats.streak += 1;
        if (state.quizStats.streak > state.quizStats.bestStreak) {
          state.quizStats.bestStreak = state.quizStats.streak;
        }
        if (!state.learned[id]) {
          state.learned[id] = { status: "learning", reviews: 1, lastSeen: Date.now() };
        }
        if (state.missed[id]) {
          state.missed[id] = Math.max(0, state.missed[id] - 1);
          if (state.missed[id] === 0) delete state.missed[id];
        }
      } else {
        state.quizStats.streak = 0;
        state.missed[id] = (state.missed[id] || 0) + 1;
        if (!state.learned[id]) {
          state.learned[id] = { status: "learning", reviews: 1, lastSeen: Date.now() };
        } else {
          state.learned[id].status = "learning";
        }
      }
      saveState(state);
    },

    saveQuizSession: function (score, total, mode) {
      state.quizStats.history.unshift({
        date: new Date().toISOString(),
        score: score,
        total: total,
        mode: mode
      });
      if (state.quizStats.history.length > 20) {
        state.quizStats.history.pop();
      }
      saveState(state);
    },

    getMetrics: function () {
      const allKeys = window.KanaData ? window.KanaData.progressKeyList() : [];
      const totalAll = allKeys.length;

      let hiraMastered = 0;
      let kataMastered = 0;
      let yoonMastered = 0;
      let totalMastered = 0;

      allKeys.forEach(function (id) {
        const isM = state.learned[id] && state.learned[id].status === "mastered";
        if (isM) {
          totalMastered++;
          if (id.startsWith("h-")) hiraMastered++;
          if (id.startsWith("k-")) kataMastered++;
          if (id.includes("kya") || id.includes("sha") || id.includes("cha") || id.includes("nya") ||
              id.includes("hya") || id.includes("mya") || id.includes("rya") || id.includes("gya") ||
              id.includes("ja") || id.includes("bya") || id.includes("pya")) {
            yoonMastered++;
          }
        }
      });

      const accuracy = state.quizStats.totalQuestions > 0
        ? Math.round((state.quizStats.totalCorrect / state.quizStats.totalQuestions) * 100)
        : 0;

      const missedIds = Object.keys(state.missed).filter(function (id) {
        return state.missed[id] > 0;
      });

      return {
        totalAll: totalAll,
        totalMastered: totalMastered,
        hiraMastered: hiraMastered,
        kataMastered: kataMastered,
        yoonMastered: yoonMastered,
        hiraTotal: window.KanaData ? window.KanaData.byScript("hiragana").length : 104,
        kataTotal: window.KanaData ? window.KanaData.byScript("katakana").length : 120,
        yoonTotal: window.KanaData ? window.KanaData.KANA.filter(function (e) { return e.type === "yoon"; }).length : 66,
        quizAccuracy: accuracy,
        quizTotal: state.quizStats.totalQuestions,
        quizCorrect: state.quizStats.totalCorrect,
        currentStreak: state.quizStats.streak,
        bestStreak: state.quizStats.bestStreak,
        streakDays: state.streakDays.current,
        missedCount: missedIds.length,
        missedIds: missedIds
      };
    },

    saveSetting: function (key, val) {
      state.settings[key] = val;
      saveState(state);
    },

    resetAll: function () {
      state = JSON.parse(JSON.stringify(defaultState));
      saveState(state);
    }
  };

  root.KanaStorage = Storage;
})(typeof window !== "undefined" ? window : globalThis);
