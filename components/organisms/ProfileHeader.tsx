import { LeftChevronSVG } from "@ensdomains/thorin";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import classcat from "classcat";
import { Tabs } from "./TabBody";

// Extract tab names into an enum for better type safety and to avoid typos

export const ProfileHeader = () => {
  const router = useRouter();
  const { name, tab } = router.query;

  // Use object destructuring to clean up the handleTabChange function
  const handleTabChange = (newTab: Tabs) => {
    router.push({ pathname: `/domains/${name}`, query: { tab: newTab } });
  };

  useEffect(() => {
    if (!tab) handleTabChange(Tabs.Profile);
  }, [tab]);

  // Extract the tab button into a separate component to reduce duplication
  const TabButton = ({ tabName }: { tabName: Tabs }) => (
    <button
      className={classcat([
        "h-full p-4 transition-colors duration-300 hover:bg-gray-100",
        tabName === tab
          ? "border-b border-blue-500 text-blue-500"
          : "text-gray-400",
      ])}
      onClick={() => handleTabChange(tabName)}
    >
      {tabName}
    </button>
  );

  return (
    <div className="flex w-full items-start border-b border-gray-200 px-[60px]">
      <div className="mx-auto flex w-full max-w-[1216px] justify-between">
        <Link
          href="/domains"
          className="flex flex-shrink items-center justify-center gap-2 p-4 text-gray-400 transition-colors duration-300 hover:text-black"
        >
          <LeftChevronSVG /> <p className="text-black">Back</p>
        </Link>
        <div className="flex items-center">
          {Object.values(Tabs).map((tab) => (
            <TabButton key={tab} tabName={tab} />
          ))}
        </div>
      </div>
    </div>
  );
};
