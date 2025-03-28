import { DecodedText } from "ensjs-monorepo/packages/ensjs/dist/types/types";
import { ETHEREUM_ADDRESS_REGEX } from "../name-registration/constants";
import { CoinType, coinTypeToNameMap } from "@ensdomains/address-encoder";

export const validateDomain = (domain: string): void => {
  if (!ETHEREUM_ADDRESS_REGEX.test(domain) && !domain?.endsWith(".eth")) {
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);
  }
};

export const transformTextRecords = (
  texts: DecodedText[],
): Record<string, string> => {
  return texts.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};

export const getCoinNameByType = (coin: string) => {
  const coinNameArr = coinTypeToNameMap[parseInt(coin) as CoinType]; // Doesn't include 1
  const coinName = coinNameArr ? coinNameArr[0] : "";
  return coinName;
};

export const updateAvatarInTexts = (
  transformedTexts: Record<string, string>,
  newAvatar?: string | null,
): Record<string, string> => {
  return Object.keys(transformedTexts).reduce(
    (acc, key) => {
      acc[key] =
        key === "avatar" && newAvatar ? newAvatar : transformedTexts[key];
      return acc;
    },
    {} as Record<string, string>,
  );
};

export const supportedCoinTypes = ["ETH", "BTC", "ARB1", "OP", "MATIC"];
