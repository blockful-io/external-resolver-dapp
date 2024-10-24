import { toast } from "react-hot-toast";
import { awaitBlockchainTxReceipt } from "@/lib/wallet/txUtils";
import {
  AeroplaneSVG,
  Button,
  CheckCircleSVG,
  LinkSVG,
  Spinner,
  WalletSVG,
} from "@ensdomains/thorin";
import Link from "next/link";
import { useAccount } from "wagmi";
import { TransactionReceipt } from "viem";
import { useEffect, useState } from "react";
import { ConnectMetamask } from "./ConnectMetamask";
import { TransactionErrorType } from "@/lib/wallet/txError";

enum BlockchainCTAState {
  OPEN_WALLET,
  APPROVING_IN_WALLET,
  WAITING_FOR_CONFIRMATION,
  CONFIRMED,
}

interface BlockchainCTAProps {
  /*
    When no authenticated address is defined (we use wagmi useAccount hook to get it),
    the component will render a ConnectMetamask button. Otherwise, it will render a Button
    with a transactionRequest callback onClick and a onSuccess callback on transaction 
    success. The only possibility of these callbacks being undefined is if the component
    is being used in a context where the user is not authenticated. Otherwise, if these 
    callbacks are undefined and an authenticated address is identified by wagmi useAccount,
    an error will be thrown in sendBlockchainTx.
  */
  transactionRequest?: () => Promise<
    `0x${string}` | TransactionErrorType | null
  >;
  onSuccess?: (txReceipt: TransactionReceipt) => void;
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

  const { chain, address } = useAccount();

  useEffect(() => {
    if (!address || !chain) {
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
    }
  }, [address, chain]);

  const sendBlockchainTx = async () => {
    if (!address) {
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
      return;
    }

    if (!chain) {
      setBlockchainCtaStatus(BlockchainCTAState.OPEN_WALLET);
      return;
    }

    if (!transactionRequest || !onSuccess) {
      throw new Error(
        "The component should not trigger blockchain related events without a transactionRequest or onSuccess callback",
      );
    }

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

      const txReceipt = await awaitBlockchainTxReceipt({
        txHash: txHashOrError,
        chain: chain,
      });

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
  const { address } = useAccount();

  if (!address) {
    return <ConnectMetamask />;
  }

  return (
    <Button
      className="w-full"
      size="medium"
      onClick={onClick}
      colorStyle="bluePrimary"
      prefix={<WalletSVG />}
    >
      Open Wallet
    </Button>
  );
};

const TransactionRequestConfirmedCTA = ({
  onClick,
  txHash,
}: BlockchainCTAComponentProps) => {
  const { chain } = useAccount();
  return (
    <div className="justify flex w-full flex-col space-y-6">
      <Button
        className="pointer-events-none"
        colorStyle="bluePrimary"
        onClick={onClick}
        shape="rounded"
        suffix={<Spinner />}
      >
        Awaiting Blockchain confirmation
      </Button>
      {txHash && (
        <Link
          target="_blank"
          className="flex space-x-2 font-bold text-blue-500 transition hover:text-blue-400"
          href={
            chain?.blockExplorers?.default.url
              ? `${chain.blockExplorers.default.url}/tx/${txHash}`
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
    <div className="group relative w-full">
      <div className="absolute left-0 top-0 z-10 group-hover:translate-y-0">
        <Button
          className="pointer-events-none"
          prefix={<AeroplaneSVG />}
          colorStyle="bluePrimary"
          onClick={onClick}
          shape="rounded"
        >
          Check your wallet
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
