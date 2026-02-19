import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SplitText } from './SplitText';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "https://cdn.shopify.com/videos/c/o/v/807d8ed2b02f4741be1362e05c7fd165.mp4";

const TeaserSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const teaserRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 70%',
        toggleActions: 'play none none none'
      }
    });

    // 1. Header Reveal
    const headerWords = container.querySelectorAll('.teaser-header .split-word');
    tl.fromTo(headerWords, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out' },
      0
    );

    // 2. Frame Draw (Clip Path on wrapper to simulate draw from top)
    tl.fromTo(teaserRef.current,
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out' },
        0.2
    );

    // 3. Text Reveal inside frame (Character stagger)
    const teaserChars = container.querySelectorAll('.teaser-text .split-char');
    tl.fromTo(teaserChars,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power2.out' },
        0.8 
    );

  }, { scope: containerRef });

  const handleInteraction = () => {
    const video = videoRef.current;
    const teaser = teaserRef.current;
    const text = textRef.current;

    if (!teaser || !video || !text) return;

    // Initial Start
    if (!hasInteracted) {
        setHasInteracted(true);
        setIsPlaying(true);

        const tl = gsap.timeline();

        // 1. Fade out text content immediately
        tl.to(text, { opacity: 0, duration: 0.3, ease: 'power2.out' });

        // 2. Expand Frame (Scale up slightly for focus)
        tl.to(teaser, {
            scale: 1.05,
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            duration: 1.2,
            ease: 'expo.inOut'
        }, 0.1);

        // 3. Morph Appearance (Red -> Transparent/Video)
        tl.to(teaser, {
            backgroundColor: '#000000', 
            borderColor: 'transparent',
            duration: 0.8,
            ease: 'power2.out'
        }, 0.3);

        // 4. Reveal & Play Video
        tl.set(video, { display: 'block' }, 0.1);
        tl.fromTo(video, 
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 1.0, 
                ease: 'power2.out', 
                onComplete: () => {
                    video.play().catch(e => console.error("Autoplay failed", e));
                } 
            },
            0.5 
        );
    } else {
        // Toggle Play/Pause
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }
  };

  return (
    <section 
        ref={containerRef} 
        className="relative w-full bg-[#F3F2ED] p-6 md:p-12 lg:p-20 flex justify-center items-center min-h-screen z-20"
    >
        {/* Editorial Frame Wrapper */}
        <div className="w-full max-w-[1400px] border border-[#050505] relative flex flex-col p-8 md:p-16 justify-between items-center">
            
            {/* Header */}
            <div className="w-full mb-12 md:mb-16 text-center">
                <h2 className="teaser-header font-serif italic font-light text-2xl md:text-5xl uppercase leading-tight text-[#050505] tracking-wide">
                    <SplitText wordClass="split-word inline-block mr-2 md:mr-3">A REASON TILL OUR REALITIES</SplitText>
                    <span className="text-[#dc2626] inline-block">
                        <SplitText wordClass="split-word inline-block">&lt;OVERLAPS&gt;</SplitText>
                    </span>
                </h2>
            </div>

            {/* Teaser Area - Vertical Aspect Ratio */}
            <div className="flex-1 flex items-center justify-center w-full relative">
                <div 
                    ref={teaserRef}
                    className="relative bg-[#dc2626] border border-[#dc2626] cursor-pointer overflow-hidden w-full max-w-sm md:max-w-md aspect-[9/16] flex items-center justify-center"
                    onClick={handleInteraction}
                    style={{ willChange: 'transform, clip-path' }}
                >
                    {/* Text Container */}
                    <div ref={textRef} className="teaser-text text-center z-10 text-white font-mono uppercase tracking-widest p-4 select-none">
                        <p className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                            <SplitText charClass="split-char inline-block">CLICK TO PLAY</SplitText>
                        </p>
                        <p className="text-xs md:text-sm opacity-90 font-medium">
                            <SplitText charClass="split-char inline-block">[PEERA HAI ANIMATED VIDEO]</SplitText>
                        </p>
                    </div>

                    {/* Hidden Video (No Controls) */}
                    <video
                        ref={videoRef}
                        src={VIDEO_SRC}
                        className="absolute inset-0 w-full h-full object-cover hidden"
                        playsInline
                        loop
                    />

                    {/* Custom Play/Pause Overlay (Visible only after interaction started and when paused) */}
                    {hasInteracted && !isPlaying && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity duration-300">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    </section>
  );
};

export default TeaserSection;