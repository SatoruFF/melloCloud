import cn from "classnames";
import React from "react";
import styles from "./planner-tabs.module.scss";

type Tab = {
  id: string;
  title: string;
};

interface Props {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabs: Tab[];
}

export const PlannerTabs: React.FC<Props> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(styles.tab, {
            [styles.active]: tab.id === activeTab,
          })}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
};
