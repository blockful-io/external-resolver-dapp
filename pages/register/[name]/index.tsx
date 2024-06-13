/* eslint-disable react-hooks/exhaustive-deps */

import { isNameAvailable } from "@/lib/name-registration/blockchain-txs";
import { ProgressBar } from "@/components/01-atoms";
import {
  ProgressBlock,
  RegistrationBody,
  RegistrationSummary,
} from "@/components/02-molecules";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { ENSName, buildENSName } from "@namehash/ens-utils";
import { useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

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

  useEffect(() => {
    let ensName: null | ENSName;

    try {
      ensName = buildENSName(name);
      setNameToRegister(ensName);

      isNameAvailable(ensName).then((isAvailable) => {
        if (!isAvailable) {
          router.push("/");
          toast.error("Name is not available");
        }
      });
    } catch {
      ensName = null;
    }
  }, [name]);

  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
      <ProgressBar />
      <ProgressBlock />
      <div className="flex justify-between z-10 mx-auto text-center py-10 h-full w-full max-w-[1216px]">
        <RegistrationBody />
        <div>
          <RegistrationSummary />
        </div>
      </div>
    </div>
  );
}
