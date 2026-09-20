/* =========================================================
 * audio.js — KanaLearn Smart Audio & Sound FX Engine
 * Mendukung Web Speech API (ja-JP) + Web Audio API synthesizer SFX
 * Berjalan 100% offline & zero-dependency
 * ========================================================= */
(function (root) {
  "use strict";

  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Voice selector helper
  let japaneseVoice = null;
  function findJapaneseVoice() {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prioritaskan ja-JP native
    const ja = voices.find(v => v.lang === "ja-JP" || v.lang === "ja_JP" || v.lang.startsWith("ja"));
    if (ja) japaneseVoice = ja;
    return ja;
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    findJapaneseVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findJapaneseVoice;
    }
  }

  const KanaAudio = {
    // Putar pelafalan karakter Kana
    speakKana: function (kanaText, onStart, onEnd) {
      if (!kanaText) return;

      // Hentikan suara yang sedang berjalan
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(kanaText);
        utterance.lang = "ja-JP";
        utterance.rate = 0.82; // Sedikit lebih lambat agar artikulasi jelas
        utterance.pitch = 1.05;

        if (!japaneseVoice) {
          findJapaneseVoice();
        }
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }

        if (onStart) utterance.onstart = onStart;
        utterance.onend = function () {
          if (onEnd) onEnd();
        };
        utterance.onerror = function () {
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback sfx jika TTS browser tidak tersedia
        KanaAudio.playTone(440, "sine", 0.1);
        if (onEnd) setTimeout(onEnd, 200);
      }
    },

    // Synthesizer SFX via Web Audio API
    playCorrectSound: function () {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Nada pertama C6
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Nada kedua E6
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
      gain2.gain.setValueAtTime(0.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.38);
    },

    playWrongSound: function () {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(164.8, now + 0.2); // E3

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    },

    playCardFlipSound: function () {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    },

    playSuccessFanfare: function () {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (idx * 0.09);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    },

    playTone: function (freq, type, duration) {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq || 440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }
  };

  root.KanaAudio = KanaAudio;
})(typeof window !== "undefined" ? window : globalThis);
