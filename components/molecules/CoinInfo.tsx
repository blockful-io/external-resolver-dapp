import { CoinInfo } from "@/lib/domain-page";
import { EthSVG, EthTransparentInvertedSVG } from "@ensdomains/thorin";
import { OptimismIcon, ArbitrumIcon, BitcoinIcon } from "@/components/atoms";
import {
  coinNameToTypeMap,
  coinTypeToNameMap,
} from "@ensdomains/address-encoder";

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
  const icon = coinInfoMap[coin]?.icon || (
    <p className="rounded-full text-sm font-bold text-blue-500">
      {coinTypeToNameMap[coin as keyof typeof coinTypeToNameMap][0]}
    </p>
  );

  if (!icon) {
    return null;
  }

  return <div className={className}>{icon}</div>;
};
