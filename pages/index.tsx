import { ChangeEvent, useEffect, useState } from "react";
import { CrossCircleSVG, Spinner, Tag } from "@ensdomains/thorin";
import { HomepageBg } from "@/components/01-atoms";
import { isNameAvailable } from "@/lib/utils/blockchain-txs";
import { ENSName, buildENSName } from "@namehash/ens-utils";
import { DebounceInput } from "react-debounce-input";
import { useRouter } from "next/router";
import { normalize } from "viem/ens";
import Link from "next/link";

enum EnsNameStatus {
  NotOwned = "NotOwned",
  Registered = "Registered",
  Available = "Available",
  Invalid = "Invalid",
  Searching = "Searching",
}

const EnsNameStatusComponents: { [key in EnsNameStatus]: React.ReactElement } =
  {
    [EnsNameStatus.NotOwned]: (
      <Tag colorStyle="blueSecondary" size="small">
        Not owned
      </Tag>
    ),
    [EnsNameStatus.Registered]: (
      <Tag colorStyle="blueSecondary" size="small">
        Registered
      </Tag>
    ),
    [EnsNameStatus.Available]: (
      <Tag colorStyle="greenSecondary" size="small">
        Available
      </Tag>
    ),
    [EnsNameStatus.Invalid]: (
      <Tag colorStyle="redSecondary" size="small">
        Invalid name
      </Tag>
    ),
    [EnsNameStatus.Searching]: <Spinner color="blue" />,
  };

export default function Home() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [domainStatus, setDomainStatus] = useState<EnsNameStatus>(
    EnsNameStatus.Available
  );

  const updateDomainStatus = (searchedDomain: string) => {
    if (!searchedDomain) return EnsNameStatus.Invalid;

    setDomainStatus(EnsNameStatus.Searching);

    let ensName: null | ENSName = null;

    // check if the domain is valid
    try {
      normalize(searchedDomain);
      ensName = buildENSName(searchedDomain);
    } catch (error) {
      console.error(error);
      setDomainStatus(EnsNameStatus.Invalid);
      return;
    }

    // check if domain is available
    isNameAvailable(ensName)
      .then((isAvailable: boolean) => {
        if (isAvailable) {
          setDomainStatus(EnsNameStatus.Available);
        } else {
          setDomainStatus(EnsNameStatus.Registered);
        }
      })
      .catch(() => {
        setDomainStatus(EnsNameStatus.Registered);
      });
  };

  const clearDomainSearch = () => {
    setDomain("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let searchedDomain = e.target.value.toLocaleLowerCase();

    setDomain(searchedDomain);
    updateDomainStatus(searchedDomain);
  };

  const goToRegisterPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.code === "Enter" &&
      domain &&
      domainStatus !== EnsNameStatus.Invalid
    ) {
      router.push(`/register/${domain}`);
    }
  };

  return (
    <div className="flex relative h-screen flex-col items-center justify-center bg-white p-4 overflow-clip">
      <HomepageBg />

      <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-y-8 -translate-y-1/3">
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-200">
          <p>🔎</p>
          <p className="text-gray-500 text-xl">Search domains</p>
        </div>
        <div className="text-center">
          <h1 className="font-semibold text-5xl pb-2 text-[#1E2122] mb-4">
            Simplify your <span className="text-gradient-ens">web3 domain</span>{" "}
            registration
          </h1>
          <p className="text-gray-500 text-xl font-normal">
            Type in your desired domain and see what&apos;s available.
          </p>
        </div>

        {/* Input  */}
        <div className="w-full h-[52px] relative max-w-[470px] ">
          <div className="absolute top-0 left-0 w-full border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex w-full justify-center items-center p-2 pl-5">
              <DebounceInput
                minLength={3}
                value={domain}
                debounceTimeout={300}
                onChange={handleInputChange}
                // if not owned, go to register page
                // if owned, go to domain page
                onKeyDown={(e) => goToRegisterPage(e)}
                className="w-full py-2 text-black text-xl"
                placeholder="Search for a domain"
              />

              <div className="flex items-center justify-center gap-2">
                {!!domain && (
                  <button
                    className="h-full p-2 hover:-translate-y-[1px] transition-all duration-200"
                    onClick={clearDomainSearch}
                  >
                    <CrossCircleSVG className="text-gray-400 h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div
              className={`transition-all duration-300 hover:bg-gray-50 overflow-hidden ${
                domain
                  ? "opacity-100 visible h-[52px]"
                  : "opacity-0 invisible h-0"
              }`}
            >
              <Link
                href={`/register/${domain}`}
                className="flex w-full justify-between  bg-transparent items-center border-gray-200 border-t p-4 pl-5"
              >
                <p className="text-gray-500 min-h-6">
                  {domain ? (
                    domain.includes(".eth") ? (
                      domain
                    ) : (
                      `${domain}.eth`
                    )
                  ) : (
                    <span />
                  )}
                </p>
                {EnsNameStatusComponents[domainStatus]}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[85%] h-[243px] blur-[125px] bg-gradient-ens absolute bottom-[-200px] rounded-ellipse"></div>
    </div>
  );
}
