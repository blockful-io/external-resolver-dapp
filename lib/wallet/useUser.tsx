/* eslint-disable react-hooks/exhaustive-deps */
import { signOut, useSession } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

interface AuthenticatedUserHook {
  loadingAuthenticatedUser: boolean;
  authedUser: `0x${string}` | null;
  disconnectUser: () => void;
}

export const useUser = (): AuthenticatedUserHook => {
  const { disconnect } = useDisconnect();
  const { data: authedUser } = useSession();
  const { address, isConnected } = useAccount();
  const [authenticatedAddress, setAuthenticatedAddress] = useState<
    `0x${string}` | null
  >(null);
  const [loadingAuthenticatedUser, setLoadingAuthenticatedUser] =
    useState(true);

  useEffect(() => {
    const authenticatedAccount =
      isConnected &&
      !!authedUser &&
      authedUser.user?.name?.toLowerCase() == address?.toLowerCase();

    setAuthenticatedAddress(authenticatedAccount && address ? address : null);
    setLoadingAuthenticatedUser(false);
  }, [authedUser, isConnected, address]);

  const disconnectUser = () => {
    signOut({ redirect: false }).then(() => {
      if (authenticatedAddress) {
        disconnect();
      }
    });
  };

  useEffect(() => {
    window.addEventListener("load", () => {
      if (window.ethereum) {
        window.ethereum.on("disconnect", disconnectUser);
      }
    });
  }, []);

  return {
    loadingAuthenticatedUser,
    authedUser: authenticatedAddress,
    disconnectUser,
  };
};
