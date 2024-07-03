import { toast } from "react-hot-toast";
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
import Link from "next/link";
import { isTestnet } from "@/lib/wallet/chains";

enum BlockchainCTAState {
  OPEN_WALLET,
  APPROVING_IN_WALLET,
  WAITING_FOR_CONFIRMATION,
  CONFIRMED,
}

interface BlockchainCTAProps {
  transactionRequest: () => Promise<
    `0x${string}` | TransactionErrorType | null
  >;
  onSuccess: (txReceipt: TransactionReceipt) => void;
}

export const BlockchainCTA = ({
  transactionRequest,
  onSuccess,
}: BlockchainCTAProps) => {
  const [blockchainCtaStatus, setBlockchainCtaStatus] =
    useState<BlockchainCTAState>(BlockchainCTAState.OPEN_WALLET);
  const [txHashOrError, setTxHashOrError] = useState<
    `0x${string}` | undefined
  >();

  const sendBlockchainTx = async () => {
    setBlockchainCtaStatus(BlockchainCTAState.APPROVING_IN_WALLET);

    const txHashOrError: `0x${string}` | TransactionErrorType | null =
      await transactionRequest();

    const transactionReverted =
      txHashOrError === TransactionErrorType.REVERTED ||
      txHashOrError === TransactionErrorType.NO_MATCHING_KEY;
    const transactionDeclined = txHashOrError === TransactionErrorType.DECLINED;
    const transactionFailedDueToInsufficientBalance =
      txHashOrError === TransactionErrorType.INSUFFICIENT_BALANCE;
    const transactionFailed = txHashOrError === TransactionErrorType.UNKNOWN;
    const transactionSucceededInDBResolver = txHashOrError === null;

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
    } else if (transactionFailedDueToInsufficientBalance) {
      console.error(txHashOrError);
      toast.error(`Insufficient wallet balance: add funds and try again`);
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
    } else if (transactionSucceededInDBResolver) {
      setBlockchainCtaStatus(BlockchainCTAState.CONFIRMED);

      onSuccess({} as TransactionReceipt);
    } else {
      setTxHashOrError(txHashOrError);

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

  return BlockchainCTAComponent({
    onClick: () => sendBlockchainTx(),
    txHash: txHashOrError,
  })[blockchainCtaStatus];
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
  txHash,
}: BlockchainCTAComponentProps) => {
  return (
    <div className="flex flex-col space-y-6 justify">
      <Button
        className="pointer-events-none"
        colorStyle="bluePrimary"
        onClick={onClick}
        shape="rounded"
        suffix={
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        }
      >
        Awaiting Blockchain confirmation
      </Button>
      {txHash && (
        <Link
          target="_blank"
          className="flex space-x-2 text-blue-500 font-bold hover:text-blue-400 transition"
          href={
            isTestnet
              ? `https://sepolia.etherscan.io/tx/${txHash}`
              : `https://etherscan.io/tx/${txHash}`
          }
        >
          <LinkSVG />
          <p>visit transaction details page</p>
        </Link>
      )}
    </div>
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
  txHash?: `0x${string}`;
}

const BlockchainCTAComponent = ({
  onClick,
  txHash,
}: BlockchainCTAComponentProps) => {
  return {
    [BlockchainCTAState.OPEN_WALLET]: <OpenWalletCTA onClick={onClick} />,
    [BlockchainCTAState.APPROVING_IN_WALLET]: (
      <TransactionRequestSentCTA onClick={onClick} />
    ),
    [BlockchainCTAState.WAITING_FOR_CONFIRMATION]: (
      <TransactionRequestConfirmedCTA onClick={onClick} txHash={txHash} />
    ),
    [BlockchainCTAState.CONFIRMED]: (
      <TransactionConfirmedInBlockchainCTA onClick={onClick} />
    ),
  };
};
