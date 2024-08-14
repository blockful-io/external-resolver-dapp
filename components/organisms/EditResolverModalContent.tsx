import { walletClient } from "@/lib/wallet/wallet-config";
import { setResolver } from "@ensdomains/ensjs/wallet";
import { Button, Input } from "@ensdomains/thorin";
import { useState } from "react";
import { isAddress } from "viem";

interface EditResolverModalContentProps {
  closeModal: () => void;
  onRecordsEdited?: () => void;
}

export const EditResolverModalContent = ({
  closeModal,
}: EditResolverModalContentProps) => {
  const [resolverAddress, setResolverAddress] = useState("");

  const handleSaveAction = async () => {
    const hash = await setResolver(walletClient, {
      name: "eduardo.eth",
      contract: "registry",
      resolverAddress: "0x6AEBB4AdC056F3B01d225fE34c20b1FdC21323A2",
      account: "0x89F8e4020c0dd384F13c288bc5743F963F9D8fdF",
    });
  };

  return (
    <div className="w-[480px] border rounded-xl overflow-hidden">
      <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b font-semibold text-black">
        Edit Resolver
      </div>
      <div className="bg-white text-black border-b border-gray-200 p-6">
        <Input
          clearable
          label={"Resolver Address"}
          placeholder={"0x00"}
          type="text"
          value={resolverAddress}
          onChange={(e) => setResolverAddress(e.target.value)}
          error={
            resolverAddress.length &&
            !isAddress(resolverAddress) &&
            "invalid address"
          }
        />
      </div>
      <div className="py-5 px-6 flex justify-end w-full bg-white gap-4">
        <div>
          <Button
            colorStyle="greySecondary"
            onClick={() => {
              closeModal();
            }}
          >
            Cancel
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              handleSaveAction();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
