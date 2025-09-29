import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function MayurjiBpFullHdNew() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  useEffect(() => {
    // Hide scrollbar and prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    // Multiple attempts to play the video
    const attemptPlay = () => {
      if (videoRef.current && !isPlaying) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setNeedsUserInteraction(false);
            console.log('Video started playing');
          })
          .catch((error) => {
            console.error('Autoplay failed:', error);
            setNeedsUserInteraction(true);
          });
      }
    };

    // Try multiple times with different delays
    const timers = [
      setTimeout(attemptPlay, 50),
      setTimeout(attemptPlay, 200),
      setTimeout(attemptPlay, 500),
      setTimeout(attemptPlay, 1000)
    ];

    // Cleanup function
    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = 'unset';
      document.body.style.margin = 'unset';
      document.body.style.padding = 'unset';
    };
  }, [isPlaying]);

  const handleVideoLoad = () => {
    attemptPlay();
  };

  const attemptPlay = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsUserInteraction(false);
          console.log('Video started playing');
        })
        .catch((error) => {
          console.error('Autoplay failed:', error);
          setNeedsUserInteraction(true);
        });
    }
  };

  const handleUserInteraction = () => {
    if (needsUserInteraction) {
      attemptPlay();
    }
  };

  const handleVideoClick = () => {
    // Handle user interaction first
    handleUserInteraction();
    
    // Then toggle fullscreen when video is clicked
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen().catch(console.error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Mayurji BP Full HD New</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx global>{`
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            background: #000;
          }
          
          * {
            box-sizing: border-box;
          }
          
          #__next {
            height: 100vh;
            width: 100vw;
            margin: 0;
            padding: 0;
          }
        `}</style>
      </Head>
      
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        <video
          ref={videoRef}
          src="/images/cat-laughing.mp4"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer',
            display: isPlaying ? 'block' : 'none'
          }}
          autoPlay
          loop
          muted={false}
          playsInline
          preload="auto"
          onClick={handleVideoClick}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
          onLoadedMetadata={handleVideoLoad}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video error:', e);
          }}
          onEnded={() => {
            // Ensure video restarts immediately when it ends
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(console.error);
            }
          }}
        />
        
        {/* Black screen overlay when video is not playing */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
            onClick={handleUserInteraction}
          >
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              {needsUserInteraction ? 'Click to start video' : 'Loading...'}
            </div>
          </div>
        )}
        
        {/* Optional: Add a subtle overlay for better UX - only show when video is playing */}
        {isPlaying && (
          <div 
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              pointerEvents: 'none',
              zIndex: 10000
            }}
          >
            Click video to toggle fullscreen • Audio enabled
          </div>
        )}
      </div>
    </>
  );
}
