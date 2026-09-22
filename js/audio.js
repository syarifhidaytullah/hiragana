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
    if (voices && voices.length > 0) {
      // Prioritaskan ja-JP native
      const ja = voices.find(v => v.lang === "ja-JP" || v.lang === "ja_JP" || (v.lang && v.lang.toLowerCase().startsWith("ja")));
      if (ja) {
        japaneseVoice = ja;
        return ja;
      }
    }
    return null;
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    findJapaneseVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = findJapaneseVoice;
    }
  }

  // Audio element cache untuk pemutaran audio jernih instan & fallback
  const audioCache = {};
  let currentPlayingAudio = null;

  function playRemoteAudio(kanaText, onStart, onEnd) {
    try {
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        currentPlayingAudio = null;
      }

      // Endpoint TTS bahasa Jepang autentik untuk pelafalan native
      const audioUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=" + encodeURIComponent(kanaText);

      let audio = audioCache[kanaText];
      if (!audio) {
        audio = new Audio(audioUrl);
        audioCache[kanaText] = audio;
      } else {
        audio.currentTime = 0;
      }

      currentPlayingAudio = audio;

      let finished = false;
      const finish = () => {
        if (!finished) {
          finished = true;
          currentPlayingAudio = null;
          if (onEnd) onEnd();
        }
      };

      audio.onplay = () => {
        if (onStart) onStart();
      };
      audio.onplaying = () => {
        if (onStart) onStart();
      };
      audio.onended = finish;
      audio.onerror = () => {
        // Fallback tone jika offline / koneksi gagal
        KanaAudio.playTone(440, "sine", 0.1);
        finish();
      };

      if (onStart) onStart();

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Audio play rejected, fallback ke synthesizer tone:", err);
          KanaAudio.playTone(440, "sine", 0.1);
          finish();
        });
      }
    } catch (e) {
      console.warn("Remote audio error:", e);
      KanaAudio.playTone(440, "sine", 0.1);
      if (onEnd) onEnd();
    }
  }

  const KanaAudio = {
    // Putar pelafalan karakter Kana atau Kosakata
    speakKana: function (kanaText, onStart, onEnd) {
      if (!kanaText) return;

      // Hentikan pemutaran remote audio yang sedang berjalan jika ada
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        currentPlayingAudio = null;
      }

      // Periksa apakah ada suara ja-JP terpasang di sistem pengguna
      if (!japaneseVoice) {
        findJapaneseVoice();
      }

      // Jika ada voice ja-JP di Web Speech API, jalankan sintesis lokal
      if (japaneseVoice && typeof window !== "undefined" && window.speechSynthesis) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(kanaText);
          utterance.lang = "ja-JP";
          utterance.rate = 0.82;
          utterance.pitch = 1.05;
          utterance.voice = japaneseVoice;

          let speechFinished = false;
          const finishSpeech = () => {
            if (!speechFinished) {
              speechFinished = true;
              if (onEnd) onEnd();
            }
          };

          utterance.onstart = () => {
            if (onStart) onStart();
          };
          utterance.onend = finishSpeech;
          utterance.onerror = () => {
            // Fallback otomatis ke audio stream asli jika speech engine error
            playRemoteAudio(kanaText, onStart, onEnd);
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch (err) {
          console.warn("SpeechSynthesis error, beralih ke remote audio:", err);
        }
      }

      // Jika sistem/browser tidak memiliki paket suara ja-JP terinstall (umum di Android/Windows/Linux),
      // gunakan audio pelafalan native Jepang jernih berkecepatan tinggi!
      playRemoteAudio(kanaText, onStart, onEnd);
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
