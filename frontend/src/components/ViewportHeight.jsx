import { useEffect, useState } from 'react';
import DesktopWarning from "./DesktopWarning"

const ViewportHeight = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the user is on a mobile device
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Example: Mobile is width <= 768px
    };

    checkIsMobile(); // Initial check
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Function to set the CSS variable for the viewport height
      const setVh = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      };

      setVh(); // Initial setting
      window.addEventListener('resize', setVh);

      return () => window.removeEventListener('resize', setVh);
    }
  }, [isMobile]);

  return (
    <div className={`${isMobile ? 'min-h-[calc(100*var(--vh))]' : 'h-screen'}`}>
      <DesktopWarning />
      {children}
    </div>
  );
};

export default ViewportHeight;
