import React, { useState, useEffect } from 'react';

const CountdownModal = ({ isOpen, onClose, countdown }) => {
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
        setCurrentCountdown(prev => {
          if (prev <= 1) {
            onClose(); // Close the modal when countdown reaches zero
            clearInterval(timer); // Clear countdown timer
            return 0; // Ensure it doesn't go below zero
          }
          return prev - 1;
        });
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
        }, 25); // Update radial progress every 50 milliseconds
    }

    return () => {
      clearInterval(timer); // Cleanup countdown timer on unmount or when dependencies change
      clearInterval(progressTimer); // Cleanup radial progress timer
    };
  }, [isOpen, countdown, onClose]);

  if (!isOpen) return null; // Don't render anything if not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1000 flex justify-center items-center">
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