import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface HoldCountdownTimerProps {
  initialSeconds?: number;
  onExpired: () => void;
}

export const HoldCountdownTimer: React.FC<HoldCountdownTimerProps> = ({ initialSeconds = 300, onExpired }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpired();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpired]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const isUrgent = secondsLeft < 60;

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
        isUrgent
          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
          : 'bg-amber-50 text-amber-800 border-amber-300'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600 shrink-0" />
      ) : (
        <Timer className="w-4 h-4 mr-1.5 text-amber-600 shrink-0" />
      )}
      <span>
        Slot Locked for You: <strong className="font-mono text-sm">{String(minutes).padStart(2, '0')}:{String(remainingSecs).padStart(2, '0')}</strong>
      </span>
    </div>
  );
};

