import { useEffect, useRef, useState } from "react";

export function useTimer(seconds: number, onExpire: () => void, enabled: boolean) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!enabled) return;
    setTimeLeft(seconds);
  }, [seconds, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return timeLeft;
}
