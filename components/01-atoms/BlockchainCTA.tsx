import { toast } from "react-hot-toast";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { awaitBlockchainTxReceipt } from "@/lib/wallet/txUtils";
import {
  AeroplaneSVG,
  Button,
  CheckCircleSVG,
  LinkSVG,
  WalletSVG,
} from "@ensdomains/thorin";
import { useState } from "react";
import { TransactionErrorType } from "@/lib/wallet/txError";
import { TransactionReceipt } from "viem";

enum BlockchainCTAState {
  OPEN_WALLET,
  APPROVING_IN_WALLET,
  WAITING_FOR_CONFIRMATION,
  CONFIRMED,
}

interface BlockchainCTAProps {
  transactionRequest: () => Promise<`0x${string}` | TransactionErrorType>;
  onSuccess: (txReceipt: TransactionReceipt) => void;
}

export const BlockchainCTA = ({
  transactionRequest,
  onSuccess,
}: BlockchainCTAProps) => {
  const [blockchainCtaStatus, setBlockchainCtaStatus] =
    useState<BlockchainCTAState>(BlockchainCTAState.OPEN_WALLET);

  const { setCommitTxReceipt } = useNameRegistration();

  const sendBlockchainTx = async () => {
    setBlockchainCtaStatus(BlockchainCTAState.APPROVING_IN_WALLET);

    const txHashOrError: `0x${string}` | TransactionErrorType =
      await transactionRequest();

    const transactionReverted =
      txHashOrError === TransactionErrorType.REVERTED ||
      txHashOrError === TransactionErrorType.NO_MATCHING_KEY;
    const transactionDeclined = txHashOrError === TransactionErrorType.DECLINED;
    const transactionFailed = txHashOrError === TransactionErrorType.UNKNOWN;

    if (transactionReverted) {
      console.error(txHashOrError);
      toast.error(`Request failed: check logs for more info`);
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
    } else if (transactionDeclined) {
      console.error(txHashOrError);
      toast.error(`Rejected: please approve transaction`);
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
    } else if (transactionFailed) {
      console.error(txHashOrError);
      toast.error(`Request failed: please try again`);
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
    } else {
      setBlockchainCtaStatus(BlockchainCTAState.WAITING_FOR_CONFIRMATION);

      const txReceipt = await awaitBlockchainTxReceipt(txHashOrError);

      if (txReceipt.status === "success") {
        setBlockchainCtaStatus(BlockchainCTAState.CONFIRMED);
        onSuccess(txReceipt);
      } else {
        console.error(txReceipt);
        toast.error(`Request failed: please try again`);
        setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
      }
    }
  };

  return BlockchainCTAComponent({ onClick: () => sendBlockchainTx() })[
    blockchainCtaStatus
  ];
};

const OpenWalletCTA = ({ onClick }: BlockchainCTAComponentProps) => {
  return (
    <Button colorStyle="bluePrimary" onClick={onClick} prefix={<WalletSVG />}>
      Open Wallet
    </Button>
  );
};

const TransactionRequestConfirmedCTA = ({
  onClick,
}: BlockchainCTAComponentProps) => {
  return (
    <Button
      className="pointer-events-none"
      colorStyle="bluePrimary"
      onClick={onClick}
      shape="rounded"
      suffix={<LinkSVG />}
    >
      Awaiting Blockchain confirmation
    </Button>
  );
};

const TransactionRequestSentCTA = ({
  onClick,
}: BlockchainCTAComponentProps) => {
  return (
    <div className="relative group">
      <div className="z-10 group-hover:translate-y-0 absolute left-0 top-0">
        <Button
          className="pointer-events-none"
          prefix={<AeroplaneSVG />}
          colorStyle="bluePrimary"
          onClick={onClick}
          shape="rounded"
        >
          Sent
        </Button>
      </div>

      <Button
        className="pointer-events-none group-hover:translate-y-0"
        colorStyle="blueSecondary"
        onClick={onClick}
        shape="rounded"
      >
        <div className="text-transparent">
          Transaction Request To Your Wallet
        </div>
      </Button>
    </div>
  );
};

export const TransactionConfirmedInBlockchainCTA = ({
  onClick,
}: BlockchainCTAComponentProps) => {
  return (
    <Button
      className="pointer-events-none"
      colorStyle="greenPrimary"
      onClick={onClick}
      shape="rounded"
      suffix={<CheckCircleSVG />}
    >
      We have confirmed the transaction was successful!
    </Button>
  );
};

interface BlockchainCTAComponentProps {
  onClick: () => void;
}

const BlockchainCTAComponent = ({ onClick }: BlockchainCTAComponentProps) => {
  return {
    [BlockchainCTAState.OPEN_WALLET]: <OpenWalletCTA onClick={onClick} />,
    [BlockchainCTAState.APPROVING_IN_WALLET]: (
      <TransactionRequestSentCTA onClick={onClick} />
    ),
    [BlockchainCTAState.WAITING_FOR_CONFIRMATION]: (
      <TransactionRequestConfirmedCTA onClick={onClick} />
    ),
    [BlockchainCTAState.CONFIRMED]: (
      <TransactionConfirmedInBlockchainCTA onClick={onClick} />
    ),
  };
};
