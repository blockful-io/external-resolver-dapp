import { CurrencyToggle, Tag, Typography } from "@ensdomains/thorin";
import CartIcon from "../../01-atoms/icons/cart-icon";
import InfoCircleIcon from "../../01-atoms/icons/info-circle";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { EnsResolver } from "@/lib/name-registration/constants";
import ArbitrumIcon from "@/components/01-atoms/icons/arbitrum";
import EthIcon from "@/components/01-atoms/icons/eth";
import DatabaseIcon from "@/components/01-atoms/icons/database";
import OptimismIcon from "@/components/01-atoms/icons/optimism";

export default function RegistrationSummary() {
  const { nameRegistrationData } = useNameRegistration();

  const { registrationYears, isPrimaryName, ensResolver } =
    nameRegistrationData;

  return (
    <div className="w-[474px] border border-gray-200 rounded-[12px] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col items-start gap-6">
        <Typography fontVariant="extraLarge">Registration summary</Typography>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-4 items-center w-full">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-200">
              <CartIcon className="h-5 w-5" />
            </div>
            <div className="flex-grow flex-col gap-1">
              <div className="flex justify-between items-center w-full">
                <Typography fontVariant="largeBold" color="green">
                  isadoranunes.eth
                </Typography>
                {isPrimaryName && (
                  <Tag colorStyle="greenSecondary">Primary name</Tag>
                )}
              </div>

              {ensResolver && <EnsResolverTag ensResolver={ensResolver} />}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-5 border-b border-gray-200">
        <div className="flex w-full justify-between items-center">
          <div className="px-4 py-3 bg-gray-50 rounded-[8px] gap-2 flex items-center justify-center border-gray-200 border">
            <InfoCircleIcon />
            <div>
              <p className="text-gray-400 text-sm font-semibold">65 gwei</p>
            </div>
          </div>
          <CurrencyToggle />
        </div>
        <div className="flex w-full justify-between items-center">
          <p>
            {registrationYears} year{registrationYears > 1 && "s"} registration
          </p>
          <div>$5.00</div>
        </div>
        <div className="flex w-full justify-between items-center">
          <p>Estimated network fee</p>
          <div>$66.29</div>
        </div>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="w-full flex justify-between items-center">
          <Typography fontVariant="bodyBold">Estimated total</Typography>
          <Typography fontVariant="bodyBold">$72.29</Typography>
        </div>
      </div>
    </div>
  );
}

const ensResolverConfig = {
  [EnsResolver.Mainnet]: {
    icon: EthIcon,
    label: "Mainnet",
  },
  [EnsResolver.Database]: {
    icon: DatabaseIcon,
    label: "Centralized Database",
  },
  [EnsResolver.Arbitrum]: {
    icon: ArbitrumIcon,
    label: "Arbitrum",
  },
  [EnsResolver.Optimism]: {
    icon: OptimismIcon,
    label: "Optimism",
  },
};

interface EnsResolverTagProps {
  ensResolver: EnsResolver;
}

const EnsResolverTag = ({ ensResolver }: EnsResolverTagProps) => {
  const config = ensResolverConfig[ensResolver];

  return (
    config && (
      <div className="flex items-center justify-start gap-1">
        <config.icon className="w-5 h-5" />
        <p className="text-gray-400">{config.label}</p>
      </div>
    )
  );
};
