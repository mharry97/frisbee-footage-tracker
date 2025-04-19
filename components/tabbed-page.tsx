import React from "react";
import { Tabs } from "@chakra-ui/react";

// Define the shape of each tab's data.
interface TabData {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface CustomTabsProps {
  defaultValue: string;
  tabs: TabData[];
}

const CustomTabs: React.FC<CustomTabsProps> = ({ defaultValue, tabs }) => {
  return (
    <Tabs.Root defaultValue={defaultValue} variant="outline" colorPalette="yellow">
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.icon && <>{tab.icon} </>}
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default CustomTabs;
