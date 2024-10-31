import {
  ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME,
  RegistrationStep,
} from "@/lib/name-registration/constants";
import { LocalNameRegistrationData } from "@/lib/name-registration/types";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { BasicInfoKey, SocialAccountsKeys } from "@/components/molecules";
import { endNameRegistrationPreviouslyOpen } from "@/lib/name-registration/localStorage";
import { useAccount } from "wagmi";
import { Button, Modal } from "@ensdomains/thorin";

export const ContinueRegistrationModal = ({
  name,
  localNameRegistrationData,
  onClose,
  open,
}: {
  open: boolean;
  name: string;
  localNameRegistrationData: LocalNameRegistrationData;
  onClose: Function;
}) => {
  const {
    setRegistrationYears,
    setCurrentRegistrationStep,
    setAsPrimaryName,
    setEnsResolver,
    setTextRecords,
    setCommitSubmitTimestamp,
    setDomainAddresses,
    nameRegistrationData,
  } = useNameRegistration();

  const { address } = useAccount();

  const continueRegistration = () => {
    // Set State of Registration Years
    if (
      localNameRegistrationData.registrationYears !== undefined &&
      localNameRegistrationData.registrationYears >= 1
    ) {
      setRegistrationYears(localNameRegistrationData.registrationYears);
    } else {
      setCurrentRegistrationStep(RegistrationStep.RegistrationYears);
      return;
    }

    // Set State of As Primary Name
    if (localNameRegistrationData.asPrimaryName !== undefined) {
      setAsPrimaryName(localNameRegistrationData.asPrimaryName as boolean);
    } else {
      setCurrentRegistrationStep(RegistrationStep.PrimaryName);
      return;
    }

    // Set State of ENS Resolver
    if (localNameRegistrationData.ensResolver !== undefined) {
      setEnsResolver(localNameRegistrationData.ensResolver);
    } else {
      setCurrentRegistrationStep(RegistrationStep.ENSResolver);
      return;
    }

    // Verifying if the commit timestamp was already saved
    if (localNameRegistrationData.commitTimestamp === undefined) {
      setCurrentRegistrationStep(RegistrationStep.RequestToRegister);
      return;
    }
    setCommitSubmitTimestamp(
      new Date(localNameRegistrationData.commitTimestamp),
    );

    if (localNameRegistrationData.textRecords === undefined) {
      setCurrentRegistrationStep(RegistrationStep.SetTextRecords);
      return;
    }
    setTextRecords(localNameRegistrationData.textRecords);
    if (
      // Checking if some of the basic info is already saved in the text records
      !Object.values(BasicInfoKey).some((key) =>
        Object.keys(
          localNameRegistrationData.textRecords as Record<string, string>,
        ).includes(key),
      )
    ) {
      setCurrentRegistrationStep(RegistrationStep.SetTextRecordsBasicInfo);
      return;
    }
    if (
      // Checking if some of the social accounts is already saved in the text records
      !Object.values(SocialAccountsKeys).some((key) =>
        Object.keys(
          localNameRegistrationData.textRecords as Record<string, string>,
        ).includes(key),
      )
    ) {
      setCurrentRegistrationStep(RegistrationStep.SetTextRecordsSocialAccounts);
      return;
    }

    if (localNameRegistrationData.domainAddresses === undefined) {
      setCurrentRegistrationStep(RegistrationStep.SetTextRecordsAddresses);
      return;
    }
    // Setting up Domain Addresses
    setDomainAddresses(localNameRegistrationData.domainAddresses);

    const currentDate = new Date();
    const commitTimestamp = new Date(localNameRegistrationData.commitTimestamp);

    const remainingTimer = Math.round(
      ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME / 1000 -
        Math.round((currentDate.getTime() - commitTimestamp.getTime()) / 1000),
    );

    if (remainingTimer > 0) {
      setCurrentRegistrationStep(RegistrationStep.WaitingRegistrationLocktime);
      return;
    }

    if (!localNameRegistrationData.commitTxReceipt) {
      setCurrentRegistrationStep(RegistrationStep.NameSecuredToBeRegistered);
      return;
    }
  };

  const clearRegistrationOfCurrentName = () => {
    if (address && nameRegistrationData.name) {
      endNameRegistrationPreviouslyOpen(address, nameRegistrationData.name);
    }
  };

  return (
    <Modal open={open} onDismiss={() => {}}>
      <div className="w-[480px] overflow-hidden rounded-xl border">
        <div className="border-b border-gray-200">
          <div className="flex w-full justify-between border-b bg-gray-50 px-6 py-5 font-semibold text-black">
            <span>
              You have a registration in progress for the name <b>{name}.eth</b>
              , do you want to
              <span className="text-sky-500"> continue </span>
              or <span className="text-gray-500"> clear </span> the progress and
              start a new registration?
            </span>
          </div>
          <div className="flex w-full justify-end gap-4 bg-white px-6 py-5">
            <Button
              onClick={() => {
                continueRegistration();
                onClose();
              }}
            >
              Continue
            </Button>
            <Button
              onClick={() => {
                clearRegistrationOfCurrentName();
                onClose();
              }}
              colorStyle="greySecondary"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
