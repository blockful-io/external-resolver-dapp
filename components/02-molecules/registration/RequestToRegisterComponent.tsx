"use client";

import BackButton from "@/components/01-atoms/BackButton";
import NextButton from "@/components/01-atoms/NextButton";
import { Button, WalletSVG } from "@ensdomains/thorin";

interface RequestToRegisterComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export default function RequestToRegisterComponent({
  handlePreviousStep,
  handleNextStep,
}: RequestToRegisterComponentProps) {
  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-[72px]">📝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Start registration process
        </h3>
        <p className="text-gray-500 text-left text-[16px]">
          First, a 0 ETH transaction is performed where your name is hashed with
          a secret key so that no one else can view the name you&apos;re trying
          to register.
        </p>
      </div>

      <div>
        <Button colorStyle="bluePrimary" prefix={<WalletSVG />}>
          Open Wallet
        </Button>
      </div>

      <NextButton onClick={handleNextStep} />
    </div>
  );
}
