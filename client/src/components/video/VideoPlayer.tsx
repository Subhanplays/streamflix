"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";

export type SubtitleTrack = { src: string; label: string; srclang: string };

type Props = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  startTime?: number;
  subtitleTracks?: SubtitleTrack[];
  onTimeUpdate?: (current: number, duration: number) => void;
  onEnded?: () => void;
  onNextEpisode?: () => void;
  className?: string;
};

function isHls(url: string) {
  return /\.m3u8(\?|$)/i.test(url);
}

/** Fewer React updates = snappier UI while video decodes in parallel */
const UI_THROTTLE_MS = 200;

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay,
  startTime = 0,
  subtitleTracks,
  onTimeUpdate,
  onEnded,
  onNextEpisode,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndedRef = useRef(onEnded);
  const lastUiTick = useRef(0);
  const [playing, setPlaying] = useState(!!autoPlay);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fs, setFs] = useState(false);
  const [hlsLoading, setHlsLoading] = useState(false);

  onTimeUpdateRef.current = onTimeUpdate;
  onEndedRef.current = onEnded;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let cancelled = false;
    hlsRef.current?.destroy();
    hlsRef.current = null;

    const attachNative = (url: string) => {
      if (video.src !== url) video.src = url;
    };

    (async () => {
      if (!isHls(src)) {
        attachNative(src);
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachNative(src);
        return;
      }
      setHlsLoading(true);
      try {
        const { default: HlsCtor } = await import("hls.js");
        if (cancelled || !videoRef.current) return;
        if (!HlsCtor.isSupported()) {
          attachNative(src);
          return;
        }
        const hls = new HlsCtor({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 12,
          maxMaxBufferLength: 24,
          startLevel: -1,
        });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(HlsCtor.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
        hls.on(HlsCtor.Events.ERROR, (_, data) => {
          if (data.fatal) console.error("HLS error", data);
        });
      } finally {
        if (!cancelled) setHlsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
      video.removeAttribute("src");
    };
  }, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = () => {
      setDuration(v.duration || 0);
      if (startTime > 0 && startTime < (v.duration || 0)) v.currentTime = startTime;
    };

    const onTime = () => {
      const t = v.currentTime;
      const d = v.duration || 0;
      onTimeUpdateRef.current?.(t, d);
      const now = performance.now();
      if (now - lastUiTick.current >= UI_THROTTLE_MS) {
        lastUiTick.current = now;
        setCurrent(t);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      onEndedRef.current?.();
    };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnd);
    };
  }, [src, startTime]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }, []);

  const seek = useCallback((ratio: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = Math.min(duration, Math.max(0, ratio * duration));
    v.currentTime = t;
    setCurrent(t);
  }, [duration]);

  const seekDelta = useCallback((sec: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = Math.min(duration, Math.max(0, v.currentTime + sec));
    v.currentTime = t;
    setCurrent(t);
  }, [duration]);

  const toggleFs = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFs(true);
      } else {
        await document.exitFullscreen();
        setFs(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!videoRef.current) return;
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekDelta(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekDelta(10);
          break;
        case "KeyF":
          e.preventDefault();
          void toggleFs();
          break;
        case "KeyM":
          e.preventDefault();
          setMuted((m) => !m);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seekDelta, toggleFs]);

  const p = duration ? current / duration : 0;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-black ring-1 ring-white/10 ${className}`}
    >
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain bg-black"
          poster={poster}
          playsInline
          preload="auto"
          onClick={togglePlay}
        >
          {subtitleTracks?.map((t) => (
            <track key={t.srclang} kind="subtitles" srcLang={t.srclang} label={t.label} src={t.src} default />
          ))}
        </video>

        {hlsLoading ? (
          <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : null}

        {/* Simple fixed bottom bar — no fade timers */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-black/75 px-3 py-2 backdrop-blur-sm sm:px-4">
          <div className="relative mb-2 h-5 pt-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-netflix transition-[width] duration-150" style={{ width: `${p * 100}%` }} />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={p}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              className="absolute inset-0 h-5 w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-black hover:bg-zinc-200"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
            </button>
            {onNextEpisode ? (
              <button
                type="button"
                onClick={onNextEpisode}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10"
                aria-label="Next"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            ) : null}
            <span className="min-w-0 flex-1 truncate text-center font-mono text-xs text-zinc-300 tabular-nums sm:text-sm">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10"
              aria-label="Mute"
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setMuted(false);
                setVolume(Number(e.target.value));
              }}
              className="h-1 w-16 shrink-0 cursor-pointer accent-netflix sm:w-24"
              aria-label="Volume"
            />
            <button
              type="button"
              onClick={() => void toggleFs()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/10"
              aria-label="Fullscreen"
            >
              {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
