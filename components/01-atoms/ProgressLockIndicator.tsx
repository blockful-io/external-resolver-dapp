import React from "react";

interface ProgressLockIndicatorProps {
  timerDone: boolean;
}

const ProgressLockIndicator = ({ timerDone }: ProgressLockIndicatorProps) => {
  return (
    <div className="relative w-[180px] h-[180px]">
      <svg
        className="animate-spin text-blue-500 h-full w-full"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={`transition-all duration-200 w-full h-full ${
            timerDone ? "opacity-100 text-green-600" : "opacity-25"
          }`}
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <circle
          className={`transition-all duration-200 ${
            timerDone ? "opacity-0" : "opacity-75"
          }`}
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="31.4 31.4"
          strokeDashoffset="0"
          fill="none"
        />
      </svg>

      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          timerDone ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-[72px]">🔒</p>
      </div>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          timerDone ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-[72px]">✅</p>
      </div>
    </div>
  );
};

export default ProgressLockIndicator;
