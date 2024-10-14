import { BackButton, NextButton } from "@/components/01-atoms";
import CountdownTimer from "@/components/01-atoms/CountdownTimer";
import { ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME } from "@/lib/name-registration/constants";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface WaitingRegistrationLocktimeComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const WaitingRegistrationLocktimeComponent = ({
  handlePreviousStep,
  handleNextStep,
}: WaitingRegistrationLocktimeComponentProps) => {
  const { nameRegistrationData } = useNameRegistration();
  const [timerDone, setTimerDone] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  useEffect(() => {
    if (nameRegistrationData.commitSubmitTimestamp === null) return;
    const date = new Date();

    const remainingTimer = Math.round(
      ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME / 1000 -
        Math.round(
          (date.getTime() -
            nameRegistrationData.commitSubmitTimestamp.getTime()) /
            1000,
        ),
    );

    if (remainingTimer < 0) {
      setTimer(0);
    } else {
      setTimer(remainingTimer);
    }
  }, [nameRegistrationData.commitSubmitTimestamp]);

  useEffect(() => {
    if (timer !== null && !timer) {
      setTimerDone(true);
    }
  }, [timer]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  useEffect(() => {
    if (timer !== null) {
      setTimeLeft(timer);

      setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (!prevTimeLeft) return 0;
          return prevTimeLeft - 1;
        });
      }, 1000);
    }
  }, [timer]);

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        {timer !== null && (
          <CountdownTimer
            onTimeEnd={() => setTimerDone(true)}
            duration={timer}
          />
        )}

        <h3 className="text-start text-[34px] font-medium">
          {timer === 0
            ? "Your domain is now secured!"
            : "We are securing your domain"}
        </h3>
        <p className="text-left text-base text-gray-500">
          {timer === 0
            ? "Your domain is prepared to be registered now!"
            : `Please wait ${timeLeft} seconds to confirm the registration commitment.`}
        </p>
      </div>
      <div className="flex w-[500px]">
        <NextButton disabled={!timerDone} onClick={handleNextStep} />
      </div>
    </div>
  );
};
