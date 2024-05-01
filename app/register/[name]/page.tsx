"use client";

import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { isAction } from "redux";

export default function RegisterNamePage() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full h-1 neon-effect bg-blue-500"></div>
      <div className="w-full h-20 bg-white neon-effect px-[60px] py-4 flex justify-between items-center border-b border-gray-200">
        {progressSteps.map((step, index) => {
          return (
            <ProgressComponent
              title={step.title}
              subtitle={step.subtitle}
              stepNumber={index + 1}
              key={step.title}
              // TODO: review this logic
              isActive={index === 0}
            />
          );
        })}
      </div>
      <div className="z-10 mx-auto text-center py-10  px-[60px] h-full">
        <h1 className="mb-5 text-xl font-semibold">Register Name Page</h1>
        <p className="mb-10">
          currentRegistrationStep:{" "}
          {nameRegistrationData.currentRegistrationStep}
        </p>
        <button
          className="m-3 p-3 bg-white border border-gray-300 rounded-md text-black"
          onClick={() =>
            setCurrentRegistrationStep(RegistrationStep.ENSResolver)
          }
        >
          Set ENS Resolver
        </button>
        <button
          className="m-3 p-3 bg-white border border-gray-300 rounded-md text-black"
          onClick={() =>
            setCurrentRegistrationStep(RegistrationStep.PrimaryName)
          }
        >
          Set as Primary Name
        </button>
      </div>
    </div>
  );
}

interface ProgressStep {
  title: string;
  subtitle: string;
}

const progressSteps: ProgressStep[] = [
  { title: "Domain settings", subtitle: "Customize name preferences" },
  { title: "Request to register", subtitle: "Commit to avoid front-running" },
  { title: "Register domain", subtitle: "Registration transcation" },
];

interface ProgressComponentProps extends ProgressStep {
  stepNumber: number;
  isActive: boolean;
}

const ProgressComponent = ({
  title,
  subtitle,
  stepNumber,
  isActive,
}: ProgressComponentProps) => {
  return (
    <div className="flex gap-3 items-center justify-center">
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full ${
          isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        {stepNumber}
      </div>
      <div className="flex flex-col">
        <h3
          className={`text-sm  ${
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
