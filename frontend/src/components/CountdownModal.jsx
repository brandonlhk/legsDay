import React, { useState, useEffect } from 'react';

const CountdownModal = ({ isOpen, countdown, onClose, audioRef, setIsWorkoutPaused }) => {
  const [currentCountdown, setCurrentCountdown] = useState(countdown);
  const [radialProgress, setRadialProgress] = useState(100); // Start at 100%

  useEffect(() => {
    let timer;
    let progressTimer;

    if (isOpen) {
      setCurrentCountdown(countdown); // Reset to the new countdown value when opened
      setRadialProgress(100); // Reset radial progress to 100%

      // Countdown timer
      timer = setInterval(() => {
        setCurrentCountdown(prev => prev - 1);
      }, 1000); // Update countdown every second

      // Radial progress timer
      const totalSteps = countdown * 40; // Total steps for smoother transition
      let step = 0; // Initialize step counter

      progressTimer = setInterval(() => {
        if (step < totalSteps) {
          setRadialProgress(prev => {
            const newProgress = prev - (100 / totalSteps); // Decrease by a smaller fraction for smoothness
            return newProgress < 0 ? 0 : newProgress; // Ensure it doesn't go below zero
          });
          step++; // Increment step counter
        } else {
          clearInterval(progressTimer); // Clear progress timer when done
        }
      }, 25); // Update radial progress every 25 milliseconds
    }

    return () => {
      clearInterval(timer); // Cleanup countdown timer on unmount or when dependencies change
      clearInterval(progressTimer); // Cleanup radial progress timer
    };
  }, [isOpen, countdown]);

  // Effect to handle when countdown reaches 0
  useEffect(() => {
    if (currentCountdown === 0) {
      // Play audio when countdown reaches 0
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }

      // Update state in the parent component and close the modal
      setIsWorkoutPaused(true); // Set workout paused after countdown
      onClose(); // Close modal
    }
  }, [currentCountdown, setIsWorkoutPaused, onClose, audioRef]);

  if (!isOpen) return null; // Don't render anything if not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex flex-col justify-center items-center h-screen overflow-hidden">
      <p className="text-6xl mb-14 text-white">Starting in</p>
      <div 
        className="radial-progress text-white" 
        style={{ 
          "--value": radialProgress, 
          "--size": "10rem", 
          "--thickness": "1rem", 
          transition: "all 0.1s ease-in-out" // Smooth transition for radial progress
        }} 
        role="progressbar"
      >
        <p className="text-6xl">{currentCountdown}</p>
      </div>
    </div>
  );
};

export default CountdownModal;
