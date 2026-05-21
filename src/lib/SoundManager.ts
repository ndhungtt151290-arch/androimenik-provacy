import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MUTE_KEY = "gentsuki_sound_muted";

let _effectPlayers: ReturnType<typeof createAudioPlayer>[] = [];
let _isMuted = false;
let _audioReady = false;

async function ensureAudioReady() {
  if (_audioReady) return;
  _audioReady = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
    });
  } catch (e) {
    _audioReady = false;
  }
}

async function loadMuteState() {
  try {
    const val = await AsyncStorage.getItem(MUTE_KEY);
    _isMuted = val === "true";
    await setIsAudioActiveAsync(!_isMuted);
  } catch {
    _isMuted = false;
  }
}

async function stopAllSounds() {
  _effectPlayers.forEach((p) => {
    p.pause();
    p.remove();
  });
  _effectPlayers = [];
}

export const SoundManager = {
  init: async () => {
    await ensureAudioReady();
    await loadMuteState();
  },

  get isMuted() {
    return _isMuted;
  },

  toggleMute: async () => {
    _isMuted = !_isMuted;
    try {
      await AsyncStorage.setItem(MUTE_KEY, String(_isMuted));
      if (_isMuted) {
        await stopAllSounds();
      }
      await setIsAudioActiveAsync(!_isMuted);
    } catch {
      // ignore
    }
  },

  playTapClick: async () => {
    if (_isMuted) return;
    await ensureAudioReady();
    const player = createAudioPlayer(require("../../assets/sounds/tap-click.mp3"), {
      keepAudioSessionActive: true,
    });
    _effectPlayers.push(player);
    player.play();
    player.addListener("playbackStatusUpdate", () => {
      if (player.playbackState === "ended") {
        _effectPlayers = _effectPlayers.filter((p) => p !== player);
        player.remove();
      }
    });
  },

  playConfirmTap: async () => {
    if (_isMuted) return;
    await ensureAudioReady();
    const player = createAudioPlayer(require("../../assets/sounds/confirm-tap.mp3"), {
      keepAudioSessionActive: true,
    });
    _effectPlayers.push(player);
    player.play();
    player.addListener("playbackStatusUpdate", () => {
      if (player.playbackState === "ended") {
        _effectPlayers = _effectPlayers.filter((p) => p !== player);
        player.remove();
      }
    });
  },

  playCorrectChapter: async () => {
    if (_isMuted) return;
    await ensureAudioReady();
    const player = createAudioPlayer(require("../../assets/sounds/correct-chapter.mp3"), {
      keepAudioSessionActive: true,
    });
    _effectPlayers.push(player);
    player.play();
    player.addListener("playbackStatusUpdate", () => {
      if (player.playbackState === "ended") {
        _effectPlayers = _effectPlayers.filter((p) => p !== player);
        player.remove();
      }
    });
  },

  playWrongChapter: async () => {
    if (_isMuted) return;
    await ensureAudioReady();
    const player = createAudioPlayer(require("../../assets/sounds/wrong-chapter.mp3"), {
      keepAudioSessionActive: true,
    });
    _effectPlayers.push(player);
    player.play();
    player.addListener("playbackStatusUpdate", () => {
      if (player.playbackState === "ended") {
        _effectPlayers = _effectPlayers.filter((p) => p !== player);
        player.remove();
      }
    });
  },

  playExamSuccess: async () => {
    if (_isMuted) return;
    await ensureAudioReady();
    const player = createAudioPlayer(require("../../assets/sounds/exam-success.mp3"), {
      keepAudioSessionActive: true,
    });
    _effectPlayers.push(player);
    player.play();
    player.addListener("playbackStatusUpdate", () => {
      if (player.playbackState === "ended") {
        _effectPlayers = _effectPlayers.filter((p) => p !== player);
        player.remove();
      }
    });
  },

  playExamFail: async () => {
    if (_isMuted) return;
    await ensureAudioReady();
    const player = createAudioPlayer(require("../../assets/sounds/exam-fail.mp3"), {
      keepAudioSessionActive: true,
    });
    _effectPlayers.push(player);
    player.play();
    player.addListener("playbackStatusUpdate", () => {
      if (player.playbackState === "ended") {
        _effectPlayers = _effectPlayers.filter((p) => p !== player);
        player.remove();
      }
    });
  },
};
