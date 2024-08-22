import { DecodedText } from "@ensdomains/ensjs/dist/types/types";
import { ETHEREUM_ADDRESS_REGEX } from "../name-registration/constants";
import { cryptocurrencies } from "./constants";

export const validateDomain = (domain: string): void => {
  if (!ETHEREUM_ADDRESS_REGEX.test(domain) && !domain?.endsWith(".eth")) {
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);
  }
};

export const transformTextRecords = (
  texts: DecodedText[]
): Record<string, string> => {
  return texts.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};

export const updateAvatarInTexts = (
  transformedTexts: Record<string, string>,
  newAvatar?: string | null
): Record<string, string> => {
  return Object.keys(transformedTexts).reduce((acc, key) => {
    acc[key] =
      key === "avatar" && newAvatar ? newAvatar : transformedTexts[key];
    return acc;
  }, {} as Record<string, string>);
};

export const getSupportedCoins = (): string[] => [
  cryptocurrencies.ETH,
  cryptocurrencies.BTC,
  cryptocurrencies.ARB1,
  cryptocurrencies.OP,
  cryptocurrencies.MATIC,
];
