
import { useState, useEffect, useCallback } from 'react';

interface KeyPressOptions {
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
}

export const useKeyPress = (targetKey: string, options: KeyPressOptions = {}): boolean => {
  const [keyPressed, setKeyPressed] = useState(false);

  const downHandler = useCallback((event: KeyboardEvent) => {
    const { key, metaKey, ctrlKey, shiftKey } = event;
    if (key.toLowerCase() === targetKey.toLowerCase()) {
      const metaCondition = options.metaKey === undefined || metaKey === options.metaKey;
      const ctrlCondition = options.ctrlKey === undefined || ctrlKey === options.ctrlKey;
      const shiftCondition = options.shiftKey === undefined || shiftKey === options.shiftKey;

      if (metaCondition && ctrlCondition && shiftCondition) {
        event.preventDefault();
        setKeyPressed(true);
      }
    }
  }, [targetKey, options]);

  const upHandler = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    if (key.toLowerCase() === targetKey.toLowerCase()) {
      setKeyPressed(false);
    }
  }, [targetKey]);

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]);

  return keyPressed;
};
