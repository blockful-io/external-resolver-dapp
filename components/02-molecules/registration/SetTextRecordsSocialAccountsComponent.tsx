import { BackButton, NextButton } from "@/components/01-atoms";
import { useEffect, useState } from "react";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
import { useAccount } from "wagmi";

interface SetTextRecordsSocialAccountsComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export enum SocialAccountsKeys {
  EMAIL = "email",
}

export const SetTextRecordsSocialAccountsComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsSocialAccountsComponentProps) => {
  const { setTextRecords, nameRegistrationData } = useNameRegistration();
  const [socialAccounts, setSocialAccounts] = useState({
    [SocialAccountsKeys.EMAIL]: "",
  });
  const { address } = useAccount();

  useEffect(() => {
    const socialAccountsTextRecords = Object.values(SocialAccountsKeys).reduce(
      (acc, key) => ({
        ...acc,
        [key]: nameRegistrationData?.textRecords[key],
      }),
      {},
    );
    setSocialAccounts({ ...socialAccounts, ...socialAccountsTextRecords });
  }, []);

  const saveSocialAccountsTextRecordsInLocalStorage = () => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        textRecords: { ...nameRegistrationData.textRecords, ...socialAccounts },
      });
    }
  };
  return (
    <div className="flex w-full flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <div>
          <p className="text-start text-sm font-bold text-[#9b9ba7]">
            Profile settings
          </p>
          <h1 className="text-[30px] font-bold text-[#1E2122]">
            Social accounts
          </h1>
        </div>
        <form className="mb-[10px] flex w-full flex-col space-y-[22px]">
          {Object.values(SocialAccountsKeys).map((socialAccount) => (
            <div
              key={socialAccount}
              className="flex w-full flex-col items-start space-y-2"
            >
              <div className="flex w-full items-center justify-between text-gray-400">
                <label
                  htmlFor={socialAccount}
                  className="text-sm text-[#1E2122]"
                >
                  {socialAccount}
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
                id={socialAccount}
                value={socialAccounts[socialAccount as SocialAccountsKeys]}
                onChange={(e) =>
                  setSocialAccounts({
                    ...socialAccounts,
                    [socialAccount]: e.target.value,
                  })
                }
                className="min-h-[37px] w-full rounded-lg border-2 border-[#e8e8e8] p-3 focus:border-2 focus:border-blue-600"
              />
            </div>
          ))}
          {/* <Button prefix={<PlusSVG />} colorStyle="blueSecondary" onClick={}>
            Add account
          </Button> */}
        </form>
      </div>
      <div className="flex w-[500px]">
        <NextButton
          onClick={() => {
            setTextRecords({
              ...nameRegistrationData.textRecords,
              ...socialAccounts,
            });
            saveSocialAccountsTextRecordsInLocalStorage();
            handleNextStep();
          }}
        />
      </div>
    </div>
  );
};
