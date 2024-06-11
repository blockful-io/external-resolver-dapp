import { BackButton, NextButton } from "@/components/01-atoms";
import CountdownTimer from "@/components/01-atoms/CountdownTimer";
import { useState } from "react";

interface WaitingRegistrationLocktimeComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const WaitingRegistrationLocktimeComponent = ({
  handlePreviousStep,
  handleNextStep,
}: WaitingRegistrationLocktimeComponentProps) => {
  const [timerDone, setTimerDone] = useState(false);

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <CountdownTimer onTimeEnd={() => setTimerDone(true)} duration={60} />

        <h3 className="text-start text-[34px] font-medium">
          We are securing your domain
        </h3>
        <p className="text-gray-500 text-left text-base">
          Please wait 60 seconds to confirm the registration commitment.
        </p>
      </div>
      <NextButton disabled={!timerDone} onClick={handleNextStep} />
    </div>
  );
};
