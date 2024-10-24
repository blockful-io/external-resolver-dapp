import { setPrimaryName } from "@ensdomains/ensjs/wallet";

import { CrossSVG, Modal } from "@ensdomains/thorin";
import { TransactionReceipt } from "viem";

import { useWalletClient } from "wagmi";
import { walletWagmiConfig } from "@/lib/wallet/wallet-config";
import toast from "react-hot-toast";
import { BlockchainCTA } from "../01-atoms";
import { TransactionErrorType } from "@/lib/wallet/txError";

interface SetPrimaryNameModalProps {
  closeModal: () => void;
  onRecordsEdited?: () => void;
  onDismiss: () => void;
  isOpen: boolean;
  name: string;
}

export const SetPrimaryNameModal = ({
  closeModal,
  onRecordsEdited,
  onDismiss,
  isOpen,
  name,
}: SetPrimaryNameModalProps) => {
  const { data: walletClient } = useWalletClient({ config: walletWagmiConfig });

  const handleSetPrimaryName = async (): Promise<
    `0x${string}` | TransactionErrorType | null
  > => {
    if (!walletClient) {
      toast.error("No wallet client found. Please contact our team.");
      return null;
    }

    try {
      return setPrimaryName(walletClient, {
        name: name,
      });
    } catch (error) {
      return null;
    }
  };

  return (
    <Modal open={isOpen} onDismiss={onDismiss}>
      <div className="flex w-[580px] flex-col overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-medium">Set {name} as primary name</h2>
          <button
            className="rounded-md p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700"
            onClick={closeModal}
          >
            <CrossSVG className="h-4 w-4" />
          </button>
        </div>

        <div className="flex w-full gap-2 p-4">
          <BlockchainCTA
            onSuccess={(txReceipt: TransactionReceipt) => {
              toast.success("Primary name set successfully");
            }}
            transactionRequest={handleSetPrimaryName}
          />
        </div>
      </div>
    </Modal>
  );
};
