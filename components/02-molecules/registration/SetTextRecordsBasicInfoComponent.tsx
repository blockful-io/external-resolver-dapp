import { BackButton, NextButton } from "@/components/01-atoms";
import { useState } from "react";
import cc from "classcat";

interface SetTextRecordsBasicInfoComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

enum BasicInfoKey {
  WEBSITE = "Website",
  DESCRIPTION = "Description",
}

export const SetTextRecordsBasicInfoComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsBasicInfoComponentProps) => {
  const [basicInfo, setBasicInfo] = useState([
    {
      key: BasicInfoKey.WEBSITE,
      value: "",
    },
    {
      key: BasicInfoKey.DESCRIPTION,
      value: "",
    },
  ]);

  const [hasErrorInKeyValues, setHasErrorInKeyValues] = useState({
    [BasicInfoKey.WEBSITE]: false,
    [BasicInfoKey.DESCRIPTION]: false,
  });

  const validateForm = () => {
    let websiteIsValid = true;
    let descriptionIsValid = true;

    const websiteInfo = basicInfo.find(
      (textRecord) => textRecord.key === BasicInfoKey.WEBSITE
    );

    if (
      websiteInfo?.value &&
      websiteInfo?.value.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
      ) === null
    ) {
      websiteIsValid = false;
    }

    setHasErrorInKeyValues({
      [BasicInfoKey.WEBSITE]: !websiteIsValid,
      [BasicInfoKey.DESCRIPTION]: false,
    });

    if (websiteIsValid && descriptionIsValid) {
      handleNextStep();
    }
  };

  return (
    <div className="w-full flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <div>
          <p className="text-sm text-[#9b9ba7] font-bold text-start">
            Profile settings
          </p>
          <h1 className="text-[30px] text-[#1E2122] font-bold">Basic info</h1>
        </div>
        <form className="flex flex-col space-y-[22px] mb-[10px] w-full">
          {basicInfo.map((info) => (
            <div
              key={info.key}
              className="flex flex-col items-start space-y-2 w-full"
            >
              <label htmlFor={info.key} className="text-[#1E2122] text-sm">
                {info.key}
              </label>
              <input
                type="text"
                id={info.key}
                onChange={(e) =>
                  setBasicInfo(
                    basicInfo.map((info) =>
                      info.key === info.key
                        ? { ...info, value: e.target.value }
                        : info
                    )
                  )
                }
                className={cc([
                  "w-full p-3 border-[#e8e8e8] border-2 rounded-lg min-h-[37px] focus:border-blue-600 focus:border-2",
                  {
                    "border-red-400": hasErrorInKeyValues[info.key],
                  },
                ])}
              />
            </div>
          ))}
        </form>
      </div>
      <NextButton onClick={validateForm} />
    </div>
  );
};
