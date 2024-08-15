import { EnsResolver } from "@/lib/name-registration/constants";
import { OptimismIcon } from "./icons/optimism";
import { ArbitrumIcon } from "./icons/arbitrum";
import { DatabaseIcon } from "./icons/database";
import { EthIcon } from "./icons/eth-icon";

const ensResolverConfig = {
  // [EnsResolver.Mainnet]: {
  //   icon: EthIcon,
  //   label: "Mainnet",
  //   enabled: true,
  // },
  [EnsResolver.Database]: {
    icon: DatabaseIcon,
    label: "Off-chain",
    enabled: true,
  },
  [EnsResolver.Custom]: {
    icon: DatabaseIcon,
    label: "Custom-resolver",
    enabled: true,
  },
  [EnsResolver.Arbitrum]: {
    icon: ArbitrumIcon,
    label: "Arbitrum",
    enabled: false,
  },
  [EnsResolver.Optimism]: {
    icon: OptimismIcon,
    label: "Optimism",
    enabled: false,
  },
};

interface EnsResolverTagProps {
  ensResolver: EnsResolver;
}

export const EnsResolverTag = ({ ensResolver }: EnsResolverTagProps) => {
  const config = ensResolverConfig[ensResolver];

  if (!config) return <></>;

  return (
    <div className="flex items-center justify-start gap-1">
      <config.icon className="w-5 h-5" />
      <p className="text-gray-400">{config.label}</p>
    </div>
  );
};
