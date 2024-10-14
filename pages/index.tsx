import { ChangeEvent, useState } from "react";
import { CrossCircleSVG } from "@ensdomains/thorin";
import { HomepageBg } from "@/components/01-atoms";
import { isNameAvailable } from "@/lib/utils/blockchain-txs";
import { ENSName, buildENSName } from "@namehash/ens-utils";
import { DebounceInput } from "react-debounce-input";
import { useRouter } from "next/router";
import { normalize } from "viem/ens";
import Link from "next/link";
import { EnsDomainStatus } from "@/types/ensDomainStatus";
import { domainWithEth, stringHasMoreThanOneDot } from "@/lib/utils/formats";
import { DomainStatus } from "@/components/02-molecules";
import toast from "react-hot-toast";
import { usePublicClient } from "wagmi";
import { PublicClient } from "viem";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";

export default function Home() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [domainStatus, setDomainStatus] = useState<EnsDomainStatus>(
    EnsDomainStatus.Invalid,
  );

  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  const checkDomainAvailability = async (ensName: string) => {
    try {
      const isAvailable: boolean = await isNameAvailable({
        ensName: ensName,
        publicClient: publicClient,
      });
      if (isAvailable) {
        setDomainStatus(EnsDomainStatus.Available);
      } else {
        setDomainStatus(EnsDomainStatus.Registered);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error has occurred. Please try again later");
    }
  };

  const updateDomainStatus = async (searchedDomain: string) => {
    if (!searchedDomain) return EnsDomainStatus.Invalid;

    setDomainStatus(EnsDomainStatus.Searching);

    let ensName: null | ENSName = null;

    // check if the domain is valid
    try {
      normalize(searchedDomain);
      ensName = buildENSName(searchedDomain);
    } catch (error) {
      console.error(error);
      setDomainStatus(EnsDomainStatus.Invalid);
      return;
    }

    // check if domain is supported
    if (stringHasMoreThanOneDot(domainWithEth(searchedDomain))) {
      setDomainStatus(EnsDomainStatus.NotSupported);
      return;
    }

    await checkDomainAvailability(domainWithEth(ensName.name));
  };

  const clearDomainSearch = () => {
    setDomain("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let searchedDomain = e.target.value.toLocaleLowerCase();
    setDomain(searchedDomain);
    updateDomainStatus(searchedDomain);
  };

  const getDomainRedirectionRoute = (): string => {
    if (domainStatus === EnsDomainStatus.Available) {
      return `/register/${domain}`;
    } else if (domainStatus === EnsDomainStatus.Registered) {
      return `/domains/${domainWithEth(domain)}`;
    }
    return "";
  };

  const goToRegisterPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && domain) {
      router.push(getDomainRedirectionRoute());
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-clip bg-white p-4">
      <HomepageBg />

      <div className="flex w-full max-w-6xl -translate-y-1/3 flex-col items-center justify-center gap-y-8">
        <div className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-3 py-2">
          <p>🔎</p>
          <p className="text-xl text-gray-500">Search domains</p>
        </div>
        <div className="text-center">
          <h1 className="mb-4 pb-2 text-5xl font-semibold text-[#1E2122]">
            Simplify your <span className="text-gradient-ens">web3 domain</span>{" "}
            registration
          </h1>
          <p className="text-xl font-normal text-gray-500">
            Type in your desired domain and see what&apos;s available.
          </p>
        </div>

        {/* Input  */}
        <div className="relative h-[52px] w-full max-w-[470px]">
          <div className="absolute left-0 top-0 w-full overflow-hidden rounded-xl border border-gray-200">
            <div className="flex w-full items-center justify-center p-2 pl-5">
              <DebounceInput
                minLength={3}
                value={domain}
                debounceTimeout={300}
                onChange={handleInputChange}
                onKeyDown={(e) => goToRegisterPage(e)}
                className="w-full py-2 text-xl text-black"
                placeholder="Search for a domain"
              />

              <div className="flex items-center justify-center gap-2">
                {!!domain && (
                  <button
                    className="h-full p-2 transition-all duration-200 hover:-translate-y-[1px]"
                    onClick={clearDomainSearch}
                  >
                    <CrossCircleSVG className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 hover:bg-gray-50 ${
                domain
                  ? "visible h-[52px] opacity-100"
                  : "invisible h-0 opacity-0"
              }`}
            >
              <Link
                href={getDomainRedirectionRoute()}
                className="flex w-full items-center justify-between border-t border-gray-200 bg-transparent p-4 pl-5"
              >
                <p className="min-h-6 text-gray-500">
                  {domain && domainWithEth(domain)}
                </p>
                <DomainStatus status={domainStatus} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[-200px] h-[243px] w-[85%] rounded-ellipse bg-gradient-ens blur-[125px]"></div>
    </div>
  );
}
