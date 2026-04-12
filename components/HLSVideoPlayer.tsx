"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HLSVideoPlayerProps {
  src: string;
  className?: string;
}

export const HLSVideoPlayer: React.FC<HLSVideoPlayerProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Autoplay blocked:", err));
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari fallback
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((err) => console.log("Autoplay blocked:", err));
      });
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: '',
        artist: '',
        album: '',
        artwork: []
      });
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      webkit-playsinline="true"
      x5-playsinline="true"
      disablePictureInPicture
      disableRemotePlayback
      crossOrigin="anonymous"
      controlsList="nodownload nofullscreen noremoteplayback"
      aria-hidden="true"
      tabIndex={-1}
      onContextMenu={(e) => e.preventDefault()}
      style={{ 
        objectFit: "cover",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
};
