/** @format */

import { useEffect, useRef, useState } from "react";
import { useAudioPlayer as useExpoAudioPlayer } from "expo-audio";
import type { AudioPlayer } from "expo-audio";

export type AudioPlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

export function useAudioPlayer(autoPlay = false) {
  const [source, setSource] = useState<string | null>(null);
  const player = useExpoAudioPlayer(source ?? undefined);
  const playerRef = useRef<AudioPlayer | null>(null);
  const autoPlayRef = useRef(autoPlay);

  const [status, setStatus] = useState<AudioPlayerStatus>("idle");
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    if (player) {
      playerRef.current = player;
      player.addListener("playbackStatusUpdate", (s) => {
        if (!s.isLoaded) return;
        setPosition(s.currentTime * 1000);
        setDuration(s.duration * 1000);
        if (s.playing) {
          setStatus("playing");
        } else if (s.didJustFinish) {
          setStatus("paused");
          setPosition(0);
        } else if (s.isLoaded) {
          setStatus("paused");
        }
      });
    }
  }, [player]);

  const loadAudio = async (uri: string) => {
    setStatus("loading");
    setPosition(0);
    setDuration(0);

    if (playerRef.current) {
      playerRef.current.replace(uri);
    } else {
      setSource(uri);
    }

    if (autoPlayRef.current) {
      playerRef.current?.play();
    }
    setStatus("paused");
  };

  const play = async () => {
    playerRef.current?.play();
  };

  const pause = async () => {
    playerRef.current?.pause();
    setStatus("paused");
  };

  const stop = async () => {
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(0);
      setPosition(0);
      setStatus("paused");
    }
  };

  const unload = async () => {
    setSource(null);
    setStatus("idle");
    setPosition(0);
    setDuration(0);
  };

  return {
    status,
    position,
    duration,
    loadAudio,
    play,
    pause,
    stop,
    unload,
  };
}
