import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onEnd?: () => void;
}

export function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setIsEnded(true);
        clearInterval(timer);
        onEnd?.();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  if (isEnded) {
    return (
      <div className="text-center">
        <span className="text-lg font-semibold text-red-600">Auction Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className="bg-black text-white px-3 py-2 rounded-lg min-w-[50px]">
            <span className="text-lg font-bold">{timeLeft.days}</span>
          </div>
          <span className="text-xs text-gray-600 mt-1 block">Days</span>
        </div>
      )}
      
      <div className="text-center">
        <div className="bg-black text-white px-3 py-2 rounded-lg min-w-[50px]">
          <span className="text-lg font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-gray-600 mt-1 block">Hours</span>
      </div>
      
      <div className="text-center">
        <div className="bg-black text-white px-3 py-2 rounded-lg min-w-[50px]">
          <span className="text-lg font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-gray-600 mt-1 block">Min</span>
      </div>
      
      <div className="text-center">
        <div className="bg-black text-white px-3 py-2 rounded-lg min-w-[50px]">
          <span className="text-lg font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs text-gray-600 mt-1 block">Sec</span>
      </div>
    </div>
  );
}