import { BackButton, NextButton } from "@/components/01-atoms";
import ProgressLockIndicator from "@/components/01-atoms/ProgressLockIndicator";
import { useEffect, useState } from "react";

interface WaitingRegistrationLocktimeComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export function WaitingRegistrationLocktimeComponent({
  handlePreviousStep,
  handleNextStep,
}: WaitingRegistrationLocktimeComponentProps) {
  const [timerDone, setTimerDone] = useState(false);

  // Simulate a delay to demonstrate the transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        {/* <CountdownTimer duration={5} /> */}
        <ProgressLockIndicator timerDone={timerDone} />

        <h3 className="text-start text-[34px] font-medium">
          We are securing your domain
        </h3>
        <p className="text-gray-500 text-left text-base">
          Please just wait a few seconds while we do this operation.
        </p>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
}
