import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

const LottieHero = ({ src, className, style }) => {
  const [animationData, setAnimationData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch(src)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setAnimationData(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [src]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setIsPlaying(true);
          else setIsPlaying(false);
        });
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className} style={style}>
      {animationData ? (
        <div className="relative w-full h-full">
          <Lottie animationData={animationData} loop autoplay={isPlaying} style={{ width: "100%", height: "100%" }} />
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
            className="absolute right-2 top-2 z-20 rounded-full bg-white/80 px-2 py-1 text-xs shadow"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-slate-400">Loading animation…</div>
      )}
    </div>
  );
};

export default LottieHero;
