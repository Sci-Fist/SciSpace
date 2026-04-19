import { useState, useEffect } from 'react';

/**
 * Returns true when the user has scrolled to within `threshold` px of the
 * page bottom, and false again once they scroll back up.
 */
function useScrollToBottom(threshold = 40) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const atBottom =
          window.innerHeight + scrollY >= document.body.scrollHeight - threshold;
        const scrollingUp = scrollY < lastScrollY;

        if (atBottom) setVisible(true);
        else if (scrollingUp) setVisible(false);

        lastScrollY = scrollY;
        ticking = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return visible;
}

export default useScrollToBottom;
