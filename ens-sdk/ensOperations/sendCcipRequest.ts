import { Address, Hex } from "viem";
import { TypedSignature } from "../../lib/utils/types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

type CcipRequestParameters = {
  body: { data: Hex; signature: TypedSignature; sender: Address };
  url: string;
};

/**
 * Sends a CCIP (Cross-Chain Interoperability Protocol) request
 *
 * This function is used to send off-chain requests, typically for resolving ENS names
 * or storing data related to ENS operations.
 *
 * @param {CcipRequestParameters} params - The parameters for the CCIP request
 * @returns {Promise<Response>} - The response from the CCIP request
 */
export async function sendCcipRequest({
  body,
  url,
}: CcipRequestParameters): Promise<Response> {
  return fetch(url.replace("/{sender}/{data}.json", ""), {
    body: JSON.stringify(body, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
