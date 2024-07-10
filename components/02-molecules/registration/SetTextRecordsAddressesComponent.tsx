import { BackButton, NextButton } from "@/components/01-atoms";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import cc from "classcat";
interface SetTextRecordsAddressesComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

interface ValidatedAddress {
  addressKey: string;
  isValidated: boolean;
}

export const SetTextRecordsAddressesComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsAddressesComponentProps) => {
  const [addresses, setAddresses] = useState({
    ETH: "",
  });

  const { setDomainAddresses, nameRegistrationData } = useNameRegistration();

  const [validatedAddresses, setValidatedAddresses] = useState<
    Array<ValidatedAddress>
  >([]);

  useEffect(() => {
    setDomainAddresses(addresses);

    const invalidatedAddresses = Object.keys(addresses).map((key) => {
      return {
        addressKey: key,
        isValidated: false,
      };
    });

    setValidatedAddresses(invalidatedAddresses);
  }, [addresses]);

  const validateAddressesInputs = () => {
    const mimicOfValidatedAddresses = [];

    for (const addressKey in nameRegistrationData.domainAddresses) {
      mimicOfValidatedAddresses.push({
        addressKey,
        isValidated:
          isAddress(nameRegistrationData.domainAddresses[addressKey]) ||
          !nameRegistrationData.domainAddresses[addressKey],
      });
    }

    setValidatedAddresses(mimicOfValidatedAddresses);
  };

  useEffect(() => {
    validateAddressesInputs();
  }, []);

  return (
    <div className="w-full flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <div>
          <p className="text-sm text-[#9b9ba7] font-bold text-start">
            Profile settings
          </p>
          <h1 className="text-[30px] text-[#1E2122] font-bold">Addresses</h1>
        </div>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col space-y-[22px] mb-[10px] w-full"
        >
          {Object.keys(addresses).map((address) => (
            <div
              key={address}
              className="flex flex-col items-start space-y-2 w-full"
            >
              <div className="flex w-full items-center text-gray-400 justify-between">
                <label htmlFor={address} className="text-[#1E2122] text-sm">
                  {address}
                </label>
                {/* <button
                  className="flex items-center space-x-1 group"
                  onClick={() =>
                    setSocialAccountsAdded(
                      socialAccountsAdded.filter(
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
                onChange={(e) =>
                  setAddresses({
                    ...addresses,
                    [address]: e.target.value,
                  })
                }
                id={address}
                className={cc([
                  "w-full p-3 border-[#e8e8e8] border-2 rounded-lg min-h-[37px] focus:border-blue-600 focus:border-2",
                  {
                    "border-red-500": validatedAddresses.find(
                      (add) => add.addressKey === address && !add.isValidated
                    ),
                  },
                ])}
              />
            </div>
          ))}
          {/* <Button prefix={<PlusSVG />} colorStyle="blueSecondary" onClick={}>
            Add account
          </Button> */}
        </form>
      </div>
      <NextButton
        onClick={
          validatedAddresses.some((add) => !add.isValidated)
            ? validateAddressesInputs
            : handleNextStep
        }
      />
    </div>
  );
};
