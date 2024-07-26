import moment from "moment";
import { isAddress } from "viem";

export function formatHexAddress(hexAddress: string): string {
  const startLength = 6;
  const endLength = 10;

  if (!hexAddress) {
    return "";
  }

  // Validate input
  if (!isAddress(hexAddress)) {
    throw new Error("Invalid Ethereum address");
  }

  // Extract parts of the address
  const start = hexAddress.slice(2, startLength + 2);
  const end = hexAddress.slice(-endLength);

  // Return the formatted address
  return `0x${start}...${end}`;
}

export const formatDate = ({ unixTimestamp }: { unixTimestamp: number }) => {
  const date = moment.unix(unixTimestamp);
  const formattedDate = date.format("D MMMM, YYYY");
  return formattedDate;
};

