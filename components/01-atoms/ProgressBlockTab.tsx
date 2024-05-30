"use client";

import {
  ProgressBlockTabStep,
  RegistrationBlock,
} from "@/lib/name-registration/constants";

interface ProgressBlockTabComponentProps extends ProgressBlockTabStep {
  stepNumber: number;
  currentRegistrationBlock: RegistrationBlock;
}

export const ProgressBlockTabComponent = ({
  title,
  subtitle,
  stepNumber,
  registrationBlock,
  currentRegistrationBlock,
}: ProgressBlockTabComponentProps) => {
  const isActive = registrationBlock === currentRegistrationBlock;
  return (
    <div className="flex gap-3 items-center justify-center">
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
          isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        {stepNumber}
      </div>
      <div className="flex flex-col">
        <h3
          className={`text-sm transition-all duration-200  ${
            isActive ? "font-bold text-blue-500" : "font-normal text-black"
          }`}
        >
          {title}
        </h3>
        <h3 className="text-sm text-gray-400 leading-[16px] font-medium">
          {subtitle}
        </h3>
      </div>
    </div>
  );
};
