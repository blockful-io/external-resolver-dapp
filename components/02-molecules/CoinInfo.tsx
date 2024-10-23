import { CoinInfo } from "@/lib/domain-page";
import { EthSVG, EthTransparentInvertedSVG } from "@ensdomains/thorin";
import {
  OptimismIcon,
  ArbitrumIcon,
  BitcoinIcon,
} from "@/components/01-atoms/";
import { coinNameToTypeMap } from "@ensdomains/address-encoder";

interface CoinIconProps {
  coin: CoinInfo["coin"];
  className?: string;
}

const coinInfoMap: Record<string, { icon: React.ReactNode }> = {
  [coinNameToTypeMap.eth]: {
    icon: <EthTransparentInvertedSVG className="h-6 w-6 text-blue-500" />,
  },
  [coinNameToTypeMap.btc]: {
    icon: <BitcoinIcon className="h-6 w-6" />,
  },
  [coinNameToTypeMap.arb1]: {
    icon: <ArbitrumIcon className="h-6 w-6" />,
  },
  [coinNameToTypeMap.op]: {
    icon: <OptimismIcon className="h-6 w-6" />,
  },
};

export const CoinIcon = ({ coin, className }: CoinIconProps) => {
  const { icon } = coinInfoMap[coin] || (
    <EthSVG className="h-6 w-6 text-blue-500" />
  );

  if (!icon) {
    return null;
  }

  return <div className={className}>{icon}</div>;
};
