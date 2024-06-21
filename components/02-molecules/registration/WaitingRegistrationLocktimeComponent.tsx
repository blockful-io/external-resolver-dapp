import { BackButton, NextButton } from "@/components/01-atoms";
import CountdownTimer from "@/components/01-atoms/CountdownTimer";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useEffect, useState } from "react";

interface WaitingRegistrationLocktimeComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

const ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME = 60000;

export const WaitingRegistrationLocktimeComponent = ({
  handlePreviousStep,
  handleNextStep,
}: WaitingRegistrationLocktimeComponentProps) => {
  const { nameRegistrationData } = useNameRegistration();
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (nameRegistrationData.commitSubmitTimestamp === null) return;

    const date = new Date();

    const remainingTimer = Math.round(
      ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME / 1000 -
        Math.round(
          (date.getTime() -
            nameRegistrationData.commitSubmitTimestamp.getTime()) /
            1000
        )
    );

    if (remainingTimer < 0) {
      setTimer(0);
    } else {
      setTimer(remainingTimer);
    }
  }, []);

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        {timer !== null && <CountdownTimer duration={timer} />}

        <h3 className="text-start text-[34px] font-medium">
          {timer === 0
            ? "Your domain is now secured!"
            : "We are securing your domain"}
        </h3>
        <p className="text-gray-500 text-left text-base">
          Please just wait a few seconds while we do this operation.
        </p>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
};
