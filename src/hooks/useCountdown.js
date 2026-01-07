import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for countdown timer
 * Returns time remaining until next hour
 */
export function useCountdown(targetTime = null) {
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeToNextHour = useCallback(() => {
    const now = new Date();
    let target;

    if (targetTime) {
      target = new Date(targetTime);
    } else {
      // Default: next hour
      target = new Date(now);
      target.setHours(target.getHours() + 1);
      target.setMinutes(0);
      target.setSeconds(0);
      target.setMilliseconds(0);
    }

    const diff = target - now;

    if (diff <= 0) {
      return { minutes: 0, seconds: 0, isExpired: true };
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { minutes, seconds, isExpired: false };
  }, [targetTime]);

  useEffect(() => {
    const updateCountdown = () => {
      const { minutes, seconds, isExpired: expired } = calculateTimeToNextHour();
      setTimeRemaining({ minutes, seconds });
      setIsExpired(expired);
    };

    // Initial calculation
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeToNextHour]);

  const formattedTime = `${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;

  return {
    minutes: timeRemaining.minutes,
    seconds: timeRemaining.seconds,
    formattedTime,
    isExpired,
  };
}

export default useCountdown;
