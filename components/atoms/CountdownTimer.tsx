/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  duration: number; // duration in seconds
  onTimeEnd?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  onTimeEnd,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [remainingCircumference, setRemainingCircumference] = useState("283");

  const [timerDone, setTimerDone] = useState(timeLeft === 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => Math.max(prevTime - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeEnd?.();
      setTimerDone(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    const fraction = timeLeft / duration;
    const circumference = 2 * Math.PI * 45; // assuming radius 45 for the circle
    const newDashArray = `${fraction * circumference} ${circumference}`;
    setRemainingCircumference(newDashArray);
  }, [timeLeft, duration]);

  return (
    <div className="relative h-[180px] w-[180px]">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle
          className={`${
            timerDone ? "text-green-600" : "text-gray-300"
          } transition-color delay-1000 duration-500`}
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className="text-blue-500 transition-all duration-1000 ease-linear"
          strokeWidth="10"
          strokeDasharray={remainingCircumference}
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all delay-1000 duration-200 ${
          timerDone ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-7xl">🔒</p>
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all delay-1000 duration-200 ${
          timerDone ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-7xl">✅</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
