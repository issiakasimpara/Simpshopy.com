import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface ReactiveStateOptions<T> {
  initialValue: T;
  debounceMs?: number;
  throttleMs?: number;
  maxUpdatesPerSecond?: number;
  enableOptimisticUpdates?: boolean;
  enableBatchUpdates?: boolean;
}

interface ReactiveStateReturn<T> {
  value: T;
  setValue: (newValue: T | ((prev: T) => T)) => void;
  setValueOptimistic: (newValue: T | ((prev: T) => T)) => void;
  setValueBatch: (updates: Array<T | ((prev: T) => T)>) => void;
  isUpdating: boolean;
  lastUpdateTime: number;
  updateCount: number;
  reset: () => void;
}

/**
 * 🚀 Hook pour des états ultra-réactifs avec optimisations avancées
 */
export const useReactiveState = <T>({
  initialValue,
  debounceMs = 0,
  throttleMs = 0,
  maxUpdatesPerSecond = 60,
  enableOptimisticUpdates = true,
  enableBatchUpdates = true
}: ReactiveStateOptions<T>): ReactiveStateReturn<T> => {
  const [value, setValueState] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const throttleRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef(0);
  const pendingUpdatesRef = useRef<Array<T | ((prev: T) => T)>>([]);
  const optimisticValueRef = useRef<T>(initialValue);

  // Fonction de mise à jour optimisée
  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const now = Date.now();
    
    // Vérification du throttle
    if (throttleMs > 0 && now - lastUpdateRef.current < throttleMs) {
      return;
    }
    
    // Vérification du max updates per second
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    const minInterval = 1000 / maxUpdatesPerSecond;
    if (timeSinceLastUpdate < minInterval) {
      return;
    }

    // Mise à jour optimiste immédiate
    if (enableOptimisticUpdates) {
      const optimisticValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(optimisticValueRef.current)
        : newValue;
      optimisticValueRef.current = optimisticValue;
    }

    // Debouncing
    if (debounceMs > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        const finalValue = typeof newValue === 'function' 
          ? (newValue as (prev: T) => T)(value)
          : newValue;
        
        setValueState(finalValue);
        setIsUpdating(false);
        setUpdateCount(prev => prev + 1);
        setLastUpdateTime(Date.now());
        lastUpdateRef.current = Date.now();
      }, debounceMs);
      
      setIsUpdating(true);
    } else {
      // Mise à jour immédiate
      const finalValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      setValueState(finalValue);
      setUpdateCount(prev => prev + 1);
      setLastUpdateTime(now);
      lastUpdateRef.current = now;
    }
  }, [value, debounceMs, throttleMs, maxUpdatesPerSecond, enableOptimisticUpdates]);

  // Mise à jour optimiste (sans debouncing)
  const setValueOptimistic = useCallback((newValue: T | ((prev: T) => T)) => {
    const finalValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue;
    
    setValueState(finalValue);
    optimisticValueRef.current = finalValue;
    setUpdateCount(prev => prev + 1);
    setLastUpdateTime(Date.now());
  }, [value]);

  // Mise à jour par batch
  const setValueBatch = useCallback((updates: Array<T | ((prev: T) => T)>) => {
    if (!enableBatchUpdates) {
      updates.forEach(update => updateValue(update));
      return;
    }

    pendingUpdatesRef.current.push(...updates);
    
    // Traiter les mises à jour en batch
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const batchUpdates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = [];
      
      let currentValue = value;
      batchUpdates.forEach(update => {
        currentValue = typeof update === 'function' 
          ? (update as (prev: T) => T)(currentValue)
          : update;
      });
      
      setValueState(currentValue);
      optimisticValueRef.current = currentValue;
      setUpdateCount(prev => prev + batchUpdates.length);
      setLastUpdateTime(Date.now());
      setIsUpdating(false);
    }, debounceMs || 16); // 16ms = 60fps
  }, [value, enableBatchUpdates, debounceMs]);

  // Reset function
  const reset = useCallback(() => {
    setValueState(initialValue);
    optimisticValueRef.current = initialValue;
    setUpdateCount(0);
    setLastUpdateTime(0);
    setIsUpdating(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    
    pendingUpdatesRef.current = [];
  }, [initialValue]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: updateValue,
    setValueOptimistic,
    setValueBatch,
    isUpdating,
    lastUpdateTime,
    updateCount,
    reset
  };
};

/**
 * 🎯 Hook pour les états réactifs avec validation
 */
export const useValidatedState = <T>(
  initialValue: T,
  validator: (value: T) => { isValid: boolean; error?: string },
  options?: Omit<ReactiveStateOptions<T>, 'initialValue'>
) => {
  const [validationError, setValidationError] = useState<string | undefined>();
  const [isValid, setIsValid] = useState(() => validator(initialValue).isValid);

  const reactiveState = useReactiveState({
    initialValue,
    ...options
  });

  const setValueWithValidation = useCallback((newValue: T | ((prev: T) => T)) => {
    const finalValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(reactiveState.value)
      : newValue;
    
    const validation = validator(finalValue);
    setIsValid(validation.isValid);
    setValidationError(validation.error);
    
    if (validation.isValid) {
      reactiveState.setValue(newValue);
    }
  }, [reactiveState, validator]);

  return {
    ...reactiveState,
    setValue: setValueWithValidation,
    isValid,
    validationError,
    hasError: !isValid
  };
};

/**
 * 🔄 Hook pour les états avec historique
 */
export const useStateWithHistory = <T>(
  initialValue: T,
  maxHistorySize: number = 10
) => {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const reactiveState = useReactiveState({
    initialValue,
    enableOptimisticUpdates: false
  });

  const setValueWithHistory = useCallback((newValue: T | ((prev: T) => T)) => {
    const finalValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(reactiveState.value)
      : newValue;
    
    setHistory(prev => {
      const newHistory = [...prev.slice(0, currentIndex + 1), finalValue];
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
    reactiveState.setValue(newValue);
  }, [reactiveState, currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      reactiveState.setValue(history[newIndex]);
    }
  }, [currentIndex, history, reactiveState]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      reactiveState.setValue(history[newIndex]);
    }
  }, [currentIndex, history, reactiveState]);

  return {
    ...reactiveState,
    setValue: setValueWithHistory,
    history,
    currentIndex,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo
  };
};
