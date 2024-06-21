import { BackButton, NextButton } from "@/components/01-atoms";
import { useState } from "react";
import { Button, CrossSVG, FieldSet, Input, PlusSVG } from "@ensdomains/thorin";

interface SetTextRecordsSocialAccountsComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

interface SocialAccount {
  key: string;
  value: string;
}

const DEFAULT_SOCIAL_ACCOUNT: SocialAccount = {
  key: "Email",
  value: "",
};

export const SetTextRecordsSocialAccountsComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsSocialAccountsComponentProps) => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    DEFAULT_SOCIAL_ACCOUNT,
  ]);

  return (
    <div className="w-full flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <div>
          <p className="text-sm text-[#9b9ba7] font-bold text-start">
            Profile settings
          </p>
          <h1 className="text-[30px] text-[#1E2122] font-bold">
            Social accounts
          </h1>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col space-y-[22px] mb-[10px] w-full"
        >
          {socialAccounts.map((socialAccount) => (
            <div
              key={socialAccount.key}
              className="flex flex-col items-start space-y-2 w-full"
            >
              <div className="flex w-full items-center text-gray-400 justify-between">
                <label
                  htmlFor={socialAccount.key}
                  className="text-[#1E2122] text-sm"
                >
                  {socialAccount.key}
                </label>
                {/* <button
                  className="flex items-center space-x-1 group"
                  onClick={() =>
                    setSocialAccounts(
                      socialAccounts.filter(
                        (existingSocialAccount) =>
                          existingSocialAccount !== socialAccount
                      )
                    )
                  }
                >
                  <CrossSVG className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition" />
                  <p className="font-semibold text-sm group-hover:text-gray-500 transition">
                    Remove
                  </p>
                </button> */}
              </div>
              <input
                type="text"
                id={socialAccount.key}
                className="w-full p-3 border-[#e8e8e8] border-2 rounded-lg min-h-[37px] focus:border-blue-600 focus:border-2"
              />
            </div>
          ))}
          {/* <Button prefix={<PlusSVG />} colorStyle="blueSecondary" onClick={}>
            Add account
          </Button> */}
        </form>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
};
