import cn from "classnames";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className={cn(styles.wrapper, { [styles.hidden]: isHidden })}>
      <div className={styles.header}>
        <button className={styles.toggleBtn} onClick={() => setIsHidden(!isHidden)}>
          {isHidden ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(styles.tab, { [styles.active]: tab.id === activeTab })}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  );
};
