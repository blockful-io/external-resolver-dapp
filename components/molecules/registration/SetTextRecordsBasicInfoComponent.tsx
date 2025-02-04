import { BackButton, NextButton } from "@/components/atoms";
import { useEffect, useState } from "react";
import cc from "classcat";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useAccount } from "wagmi";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
import { capitalizeString } from "@/lib/utils/formats";

interface SetTextRecordsBasicInfoComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export enum BasicInfoKey {
  WEBSITE = "url",
  DESCRIPTION = "description",
}

export const SetTextRecordsBasicInfoComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsBasicInfoComponentProps) => {
  const [basicInfo, setBasicInfo] = useState({
    [BasicInfoKey.WEBSITE]: "",
    [BasicInfoKey.DESCRIPTION]: "",
  });

  const [hasErrorInKeyValues, setHasErrorInKeyValues] = useState({
    [BasicInfoKey.WEBSITE]: false,
    [BasicInfoKey.DESCRIPTION]: false,
  });
  const { address } = useAccount();
  const { setTextRecords, nameRegistrationData } = useNameRegistration();

  const validateForm = () => {
    const websiteInfo = basicInfo[BasicInfoKey.WEBSITE];
    var urlRegex =
      /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
    const websiteIsValid = !websiteInfo || websiteInfo.match(urlRegex);

    setHasErrorInKeyValues((prev) => ({
      ...prev,
      [BasicInfoKey.WEBSITE]: !websiteIsValid,
    }));
  };

  useEffect(() => {
    validateForm();
  }, [basicInfo[BasicInfoKey.WEBSITE]]);

  const handleInputChange = (key: BasicInfoKey, value: string) => {
    setBasicInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNextStepButton = () => {
    if (!hasErrorInKeyValues[BasicInfoKey.WEBSITE]) {
      setTextRecords({
        ...nameRegistrationData.textRecords,
        ...basicInfo,
      });
      saveTextRecordsInLocalStorage({
        ...nameRegistrationData.textRecords,
        ...basicInfo,
      });
      handleNextStep();
    }
  };

  useEffect(() => {
    const basicInfoTextRecords = Object.values(BasicInfoKey).reduce(
      (acc, key) => ({
        ...acc,
        [key]: nameRegistrationData?.textRecords[key] || "",
      }),
      {},
    );
    setBasicInfo({ ...basicInfo, ...basicInfoTextRecords });
  }, []);

  const saveTextRecordsInLocalStorage = (
    textRecords: Record<string, string>,
  ) => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        textRecords,
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-start justify-start gap-11">
      <BackButton onClick={handlePreviousStep} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <div>
          <p className="text-[#9b9ba7]font-bold text-start text-sm">
            Profile settings
          </p>
          <h1 className="text-2xl font-bold text-[#1E2122]">Basic info</h1>
        </div>
        <form className="mb-[10px] flex w-full flex-col space-y-[22px]">
          {Object.values(BasicInfoKey).map((key) => (
            <div
              key={key}
              className="flex w-full flex-col items-start space-y-2"
            >
              <label htmlFor={key} className="text-sm text-[#1E2122]">
                {capitalizeString(key)}
              </label>
              <input
                type="text"
                value={basicInfo[key as BasicInfoKey]}
                id={key}
                onChange={(e) =>
                  handleInputChange(key as BasicInfoKey, e.target.value)
                }
                className={cc([
                  "min-h-[37px] w-full rounded-lg border-2 border-gray-300 p-3 focus:border-2 focus:border-blue-600",
                  {
                    "border-red-400": hasErrorInKeyValues[key as BasicInfoKey],
                  },
                ])}
                aria-invalid={hasErrorInKeyValues[key as BasicInfoKey]}
              />
              {hasErrorInKeyValues[key as BasicInfoKey] && (
                <p className="text-sm text-red-500" aria-live="assertive">
                  Invalid {key}
                </p>
              )}
            </div>
          ))}
        </form>
      </div>
      <div className="flex w-[500px]">
        <NextButton
          disabled={hasErrorInKeyValues[BasicInfoKey.WEBSITE]}
          onClick={handleNextStepButton}
        />
      </div>
    </div>
  );
};
