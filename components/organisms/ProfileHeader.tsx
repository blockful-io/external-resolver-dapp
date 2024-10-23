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
    <div className="flex w-full items-start border-b border-gray-200 px-[60px]">
      <div className="mx-auto flex w-full max-w-[1216px] justify-between">
        <Link
          href="/domains"
          className="flex flex-shrink items-center justify-center gap-2 p-4 text-gray-400 transition-colors duration-300 hover:text-black"
        >
          <LeftChevronSVG /> <p className="text-black">Back</p>
        </Link>
        <div className="flex items-center">
          {/* Profile Tab */}
          <button
            className={`h-full p-4 ${
              tab === "profile"
                ? "border-b border-blue-500 text-blue-500"
                : "text-gray-400"
            } transition-colors duration-300 hover:bg-gray-100`}
            onClick={() => handleTabChange("profile")}
          >
            Profile
          </button>

          {/* Records Tab */}
          <button
            className={`h-full p-4 ${
              tab === "records"
                ? "border-b border-blue-500 text-blue-500"
                : "text-gray-400"
            } transition-colors duration-300 hover:bg-gray-100`}
            onClick={() => handleTabChange("records")}
          >
            Records
          </button>

          {/* Subdomains Tab */}
          <button
            className={`h-full p-4 ${
              tab === "subdomains"
                ? "border-b border-blue-500 text-blue-500"
                : "text-gray-400"
            } transition-colors duration-300 hover:bg-gray-100`}
            onClick={() => handleTabChange("subdomains")}
          >
            Subdomains
          </button>
        </div>
      </div>
    </div>
  );
};
