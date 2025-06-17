// pages/planner/Planner.tsx
import { useState } from "react";
import styles from "./Planner.module.scss";
import { PlannerTabs } from "../../../features/plannerTabs";
import { KanbanBoard } from "../../../widgets/Kanban";
import { CalendarView } from "../../../widgets/Calendar";
import { t } from "i18next";

// FIXME
const tabs = [
  { id: "kanban", title: t("planner.tabs.kanban") },
  { id: "calendar", title: t("planner.tabs.calendar") },
];

const Planner = () => {
  const [activeTab, setActiveTab] = useState("kanban");

  const renderContent = () => {
    switch (activeTab) {
      case "kanban":
        return <KanbanBoard />;
      case "calendar":
        return <CalendarView />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.planner}>
      <PlannerTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
};

export default Planner;
