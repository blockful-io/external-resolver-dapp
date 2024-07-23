import { Button, WalletSVG } from "@ensdomains/thorin";
import { WalletButton } from "@rainbow-me/rainbowkit";

export const ConnectMetamask = () => {
  return (
    <WalletButton.Custom wallet="metamask">
      {({ ready, connect }) => (
        <Button
          size="medium"
          disabled={!ready}
          onClick={connect}
          colorStyle="blueSecondary"
          prefix={<WalletSVG />}
        >
          Connect Metamask
        </Button>
      )}
    </WalletButton.Custom>
  );
};
