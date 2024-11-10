import React, { useEffect } from 'react';

const ViewportHeight = ({ children }) => {
  useEffect(() => {
    // Function to set the CSS variable for the viewport height
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    };

    // Initial setting
    setVh()

    // Update on window resize
    window.addEventListener('resize', setVh)

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div className="min-h-[calc(100*var(--vh))]">
      {children}
    </div>
  );
};

export default ViewportHeight;
