import { Outlet, NavLink } from "react-router-dom";
import { Calendar, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import cn from "classnames";
import { useState } from "react";
import styles from "./planner.module.scss";
import { PLANNER_KANBAN_ROUTE, PLANNER_CALENDAR_ROUTE } from "../../../shared/consts/routes";
import { useTranslation } from "react-i18next";

const PlannerLayout = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={styles.plannerLayout}>
      <aside className={cn(styles.sidebar, { [styles.collapsed]: isCollapsed })}>
        <div className={styles.header}>
          {!isCollapsed && <h2 className={styles.title}>{t("planner.planning")}</h2>}
          <button
            className={styles.toggleBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Развернуть" : "Свернуть"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to={PLANNER_KANBAN_ROUTE}
            className={({ isActive }) => cn(styles.navLink, { [styles.active]: isActive })}
            title={isCollapsed ? t("planner.tabs.kanban") : undefined}
          >
            <LayoutGrid size={18} />
            {!isCollapsed && <span>{t("planner.tabs.kanban")}</span>}
          </NavLink>
          <NavLink
            to={PLANNER_CALENDAR_ROUTE}
            className={({ isActive }) => cn(styles.navLink, { [styles.active]: isActive })}
            title={isCollapsed ? t("planner.tabs.calendar") : undefined}
          >
            <Calendar size={18} />
            {!isCollapsed && <span>{t("planner.tabs.calendar")}</span>}
          </NavLink>
        </nav>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default PlannerLayout;
