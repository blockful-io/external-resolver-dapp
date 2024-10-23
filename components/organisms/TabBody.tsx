import React, { useEffect } from "react";
import { ProfileTabBody, ProfileTabProps } from "./ProfileTabBody";
import { DomainData } from "@/lib/domain-page";
import { SubdomainsTabBody, SubdomainsTabProps } from "./SubdomainsTabBody";
import { useRouter } from "next/router";
import { RecordsTabBody, RecordsTabProps } from "./RecordsTabBody";

interface TabInfo<T = any> {
  component: React.ComponentType<T>;
}

export enum Tabs {
  Profile = "profile",
  Subdomains = "subdomains",
  Records = "records",
}

// Object mapping each tab to its properties
export const TabConfig: Record<Tabs, TabInfo> = {
  [Tabs.Profile]: {
    component: ProfileTabBody as React.ComponentType<ProfileTabProps>,
  },
  [Tabs.Subdomains]: {
    component: SubdomainsTabBody as React.ComponentType<SubdomainsTabProps>,
  },
  [Tabs.Records]: {
    component: RecordsTabBody as React.ComponentType<RecordsTabProps>,
  },
};

interface TabBodyProps {
  domainData: DomainData | null;
  fetchDomainData: () => void;
}

const TabBody = ({ domainData, fetchDomainData }: TabBodyProps) => {
  const router = useRouter();

  const { tab } = router.query;

  const selectedTab = tab as Tabs;

  // Check if the selected tab exists in TabConfig
  const tabExists = TabConfig[selectedTab] !== undefined;

  useEffect(() => {
    if (!tabExists) {
      // If the tab does not exist, redirect to the default tab (Tabs.Profile)
      router.push({
        pathname: router.pathname,
        query: { ...router.query, tab: Tabs.Profile },
      });
    }
  }, [tabExists, router]);

  if (!tabExists) {
    // Prevent rendering if tab is invalid; redirect is happening
    return null;
  }

  const { component: SelectedComponent } = TabConfig[selectedTab];

  // Render the selected tab's component with the specific props
  return (
    <SelectedComponent
      domainData={domainData}
      fetchDomainData={fetchDomainData}
    />
  );
};

export default TabBody;
