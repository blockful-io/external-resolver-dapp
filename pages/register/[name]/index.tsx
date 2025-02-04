/* eslint-disable react-hooks/exhaustive-deps */

import { isNameAvailable } from "@/lib/utils/blockchain-txs";
import { ProgressBar } from "@/components/atoms";
import {
  ProgressBlock,
  RegistrationBody,
  RegistrationSummary,
} from "@/components/molecules";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { ENSName, buildENSName } from "@namehash/ens-utils";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { normalize } from "viem/ens";
import { useAccount, usePublicClient } from "wagmi";
import { getOpenNameRegistrationsOfNameByWallet } from "@/lib/name-registration/localStorage";
import { isEmpty } from "lodash";
import { LocalNameRegistrationData } from "@/lib/name-registration/types";
import { ContinueRegistrationModal } from "@/components/organisms/ContinueRegistrationModalContent";
import { domainWithEth, stringHasMoreThanOneDot } from "@/lib/utils/formats";
import { PublicClient } from "viem";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";

export async function getServerSideProps({
  params,
}: {
  params: { name: string };
}) {
  return {
    props: {
      name: params.name,
    },
  };
}

export default function RegisterNamePage({ name }: { name: string }) {
  const { setNameToRegister } = useNameRegistration();
  const router = useRouter();
  const { address } = useAccount();
  const [
    modalContinueRegistrationIsOpen,
    setModalForContinuingRegistrationIsOpen,
  ] = useState(false);
  const [localNameRegistrationData, setLocalNameRegistrationData] =
    useState<LocalNameRegistrationData>({});

  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  const handleNameChange = useCallback(async () => {
    try {
      normalize(name);
    } catch {
      router.push("/");
      toast.error("Invalid name");
    }

    // check if domain is supported
    if (stringHasMoreThanOneDot(domainWithEth(name))) {
      router.push("/");
      toast.error("Name not supported");
    }

    let ensName: null | ENSName;

    try {
      const nameToRegister = name.includes(".eth") ? name : `${name}.eth`;

      ensName = buildENSName(nameToRegister);

      setNameToRegister(ensName);

      const isAvailable = await isNameAvailable({
        ensName: ensName.name,
        publicClient,
      });
      if (address) {
        const localStorageNameRegistrationData =
          getOpenNameRegistrationsOfNameByWallet(address, ensName);

        if (!isEmpty(localStorageNameRegistrationData)) {
          setModalForContinuingRegistrationIsOpen(true);
          setLocalNameRegistrationData(localStorageNameRegistrationData);
        }
      }
      if (!isAvailable) {
        router.push("/");
        toast.error("Name is not available");
      }
    } catch {
      ensName = null;
    }
  }, [name]);

  useEffect(() => {
    handleNameChange();
  }, [handleNameChange]);

  return (
    <div className="flex h-full flex-col items-center justify-start bg-white text-black">
      <ProgressBar />
      <ProgressBlock />
      <div className="z-10 mx-auto flex h-full w-full max-w-[1216px] justify-between py-10 text-center">
        <RegistrationBody />
        <div>
          <RegistrationSummary />
        </div>
      </div>
      <ContinueRegistrationModal
        open={modalContinueRegistrationIsOpen}
        name={name}
        localNameRegistrationData={localNameRegistrationData}
        onClose={() => setModalForContinuingRegistrationIsOpen(false)}
      />
    </div>
  );
}
