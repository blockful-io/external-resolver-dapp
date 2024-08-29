import { LeftChevronSVG } from "@ensdomains/thorin";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const ProfileHeader = () => {
  // https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes
  const router = useRouter();
  const { name } = router.query; // Dynamic route parameter
  const { tab } = router.query; // Query parameter

  // To handle tab changes and update the route
  const handleTabChange = (newTab: string) => {
    router.push({
      pathname: `/domains/${name}`,
      query: { tab: newTab },
    });
  };

  useEffect(() => {
    if (!tab) {
      handleTabChange("profile");
    }
  }, [tab]);

  return (
    <div className="w-full border-b border-gray-200 px-[60px] flex items-start">
      <div className="w-full max-w-[1216px] flex mx-auto justify-between">
        <Link
          href="/domains"
          className="flex items-center p-4 justify-center flex-shrink text-gray-400 hover:text-black duration-300 transition-colors gap-2"
        >
          <LeftChevronSVG /> <p className="text-black">Back</p>
        </Link>
        <div className="flex items-center">
          {/* Profile Tab */}
          <button
            className={`h-full p-4 ${
              tab === "profile"
                ? "text-blue-500 border-b border-blue-500"
                : "text-gray-400"
            } hover:bg-gray-100 transition-colors duration-300`}
            onClick={() => handleTabChange("profile")}
          >
            Profile
          </button>

          {/* Subdomains Tab */}
          <button
            className={`h-full p-4 ${
              tab === "subdomains"
                ? "text-blue-500 border-b border-blue-500"
                : "text-gray-400"
            } hover:bg-gray-100 transition-colors duration-300`}
            onClick={() => handleTabChange("subdomains")}
          >
            Subdomains
          </button>
        </div>
      </div>
    </div>
  );
};
