import React from "react";
import { Tabs } from "./ProfileHeader";
import { ProfileTab } from "./ProfileTab";
import { DomainData } from "@/lib/domain-page";
import { SubdomainsTab } from "./SubdomainsTab";

interface ProfileTabProps {
  domainData: DomainData | null;
}

interface SubdomainsTabProps {
  domainData: DomainData | null;
}

interface TabInfo<T = any> {
  component: React.ComponentType<T>;
  route: string;
  name: string;
}

// Object mapping each tab to its properties
export const TabConfig: Record<Tabs, TabInfo> = {
  [Tabs.Profile]: {
    component: ProfileTab as React.ComponentType<ProfileTabProps>,
    route: "/domains/[domain]?tab=profile",
    name: "Profile",
  },
  [Tabs.Subdomains]: {
    component: SubdomainsTab as React.ComponentType<SubdomainsTabProps>,
    route: "/domains/[domain]?tab=subdomains",
    name: "Subdomains",
  },
};

interface TabBodyProps {
  selectedTab: Tabs;
  domainData: DomainData | null;
}

const TabBody = ({ selectedTab, domainData }: TabBodyProps) => {
  const { component: SelectedComponent } = TabConfig[selectedTab];

  // Render the selected tab's component with the specific props
  return <SelectedComponent domainData={domainData} />;
};

export default TabBody;
