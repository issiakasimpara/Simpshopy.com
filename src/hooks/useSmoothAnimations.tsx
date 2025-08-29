import { useState, useCallback, useRef, useEffect } from 'react';

interface AnimationOptions {
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  delay?: number;
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

interface SmoothAnimationReturn {
  isAnimating: boolean;
  progress: number;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

/**
 * 🎨 Hook pour des animations fluides et performantes
 */
export const useSmoothAnimation = (options: AnimationOptions = {}): SmoothAnimationReturn => {
  const {
    duration = 300,
    easing = 'ease-out',
    delay = 0,
    onStart,
    onComplete,
    onUpdate
  } = options;

  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Fonctions d'easing
  const easingFunctions = {
    linear: (t: number) => t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => 1 - Math.pow(1 - t, 2),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: (t: number) => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    elastic: (t: number) => {
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
  };

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const currentProgress = Math.min(elapsed / duration, 1);
    
    // Appliquer l'easing
    const easedProgress = easingFunctions[easing](currentProgress);
    
    setProgress(easedProgress);
    
    if (onUpdate) {
      onUpdate(easedProgress);
    }

    if (currentProgress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [duration, easing, onUpdate, onComplete]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setProgress(0);
    startTimeRef.current = undefined;

    if (onStart) {
      onStart();
    }

    if (delay > 0) {
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, delay, onStart, animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    setIsAnimating(false);
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    setProgress(0);
    startTimeRef.current = undefined;
  }, [stopAnimation]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    progress,
    startAnimation,
    stopAnimation,
    resetAnimation
  };
};

/**
 * 🎯 Hook pour les transitions de valeurs numériques
 */
export const useSmoothTransition = <T extends number>(
  targetValue: T,
  options: AnimationOptions = {}
) => {
  const [currentValue, setCurrentValue] = useState<T>(targetValue);
  const animation = useSmoothAnimation(options);

  useEffect(() => {
    if (currentValue !== targetValue) {
      const startValue = currentValue;
      const endValue = targetValue;
      
      animation.onUpdate = (progress) => {
        const newValue = startValue + (endValue - startValue) * progress;
        setCurrentValue(newValue as T);
      };
      
      animation.startAnimation();
    }
  }, [targetValue, currentValue, animation]);

  return {
    value: currentValue,
    isAnimating: animation.isAnimating,
    progress: animation.progress
  };
};

/**
 * 🎨 Hook pour les animations de scroll fluides
 */
export const useSmoothScroll = () => {
  const scrollTo = useCallback((target: number | Element, options: AnimationOptions = {}) => {
    const targetPosition = typeof target === 'number' 
      ? target 
      : target.getBoundingClientRect().top + window.pageYOffset;

    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    
    const animation = useSmoothAnimation({
      duration: 800,
      easing: 'ease-out',
      ...options
    });

    animation.onUpdate = (progress) => {
      const newPosition = startPosition + distance * progress;
      window.scrollTo(0, newPosition);
    };

    animation.startAnimation();
  }, []);

  const scrollToTop = useCallback((options?: AnimationOptions) => {
    scrollTo(0, options);
  }, [scrollTo]);

  const scrollToBottom = useCallback((options?: AnimationOptions) => {
    scrollTo(document.body.scrollHeight, options);
  }, [scrollTo]);

  return {
    scrollTo,
    scrollToTop,
    scrollToBottom
  };
};

/**
 * 🎭 Hook pour les animations de visibilité
 */
export const useVisibilityAnimation = (initialVisible: boolean = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const showAnimation = useSmoothAnimation({
    duration: 300,
    easing: 'ease-out'
  });

  const hideAnimation = useSmoothAnimation({
    duration: 200,
    easing: 'ease-in'
  });

  const show = useCallback(() => {
    if (isVisible) return;
    
    setIsVisible(true);
    setIsAnimating(true);
    
    showAnimation.onComplete = () => {
      setIsAnimating(false);
    };
    
    showAnimation.startAnimation();
  }, [isVisible, showAnimation]);

  const hide = useCallback(() => {
    if (!isVisible) return;
    
    setIsAnimating(true);
    
    hideAnimation.onComplete = () => {
      setIsVisible(false);
      setIsAnimating(false);
    };
    
    hideAnimation.startAnimation();
  }, [isVisible, hideAnimation]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return {
    isVisible,
    isAnimating,
    show,
    hide,
    toggle,
    showProgress: showAnimation.progress,
    hideProgress: hideAnimation.progress
  };
};
