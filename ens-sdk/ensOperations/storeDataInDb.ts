import { DomainData, MessageData } from "@/lib/utils/types";
import { Chain, createWalletClient, custom } from "viem";
import { sendCcipRequest } from "./sendCcipRequest";

interface StoreDataInDbParams {
  domain: DomainData;
  url: string;
  message: MessageData;
  authenticatedAddress: `0x${string}`;
  chain: Chain;
}

/**
 * Stores ENS-related data in an off-chain database
 *
 * This function is used when certain ENS operations require off-chain storage.
 * It signs the data with the user's wallet and sends it to a specified URL for storage.
 *
 * @param {StoreDataInDbParams} params - The parameters for storing data
 * @returns {Promise<Response>} - The response from the storage request
 */
export async function storeDataInDb({
  domain,
  url,
  message,
  authenticatedAddress,
  chain,
}: StoreDataInDbParams): Promise<Response> {
  const client = createWalletClient({
    account: authenticatedAddress,
    chain: chain,
    transport: custom(window.ethereum),
  });

  const signature = await client.signTypedData({
    domain,
    message,
    types: {
      Message: [
        { name: "callData", type: "bytes" },
        { name: "sender", type: "address" },
        { name: "expirationTimestamp", type: "uint256" },
      ],
    },
    primaryType: "Message",
  });

  return await sendCcipRequest({
    body: {
      data: message.callData,
      signature: { message, domain, signature },
      sender: message.sender,
    },
    url,
  });
}
