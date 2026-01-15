import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import cn from "classnames";
import { Timer, Calculator, Calendar, StickyNote } from "lucide-react";
import styles from "./modules-page.module.scss";

interface IModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  gradient: string;
}

const ModulePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, находимся ли мы на базовом /modules роуте
  const isModulesListPage = location.pathname === "/modules";

  const modules: IModule[] = [
    {
      id: "1",
      name: t("modules.pomodoro.name"),
      description: t("modules.pomodoro.description"),
      icon: <Timer size={32} />,
      route: "pomodoro",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    // {
    //   id: "2",
    //   name: t("modules.calculator.name"),
    //   description: t("modules.calculator.description"),
    //   icon: <Calculator size={32} />,
    //   route: "calculator",
    //   gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    // },
    // {
    //   id: "3",
    //   name: t("modules.habit-tracker.name"),
    //   description: t("modules.habit-tracker.description"),
    //   icon: <Calendar size={32} />,
    //   route: "habit-tracker",
    //   gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    // },
    // {
    //   id: "4",
    //   name: t("modules.quick-notes.name"),
    //   description: t("modules.quick-notes.description"),
    //   icon: <StickyNote size={32} />,
    //   route: "quick-notes",
    //   gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    // },
  ];

  const handleModuleClick = (route: string) => {
    navigate(route, { relative: "path" });
  };

  // Если открыт конкретный модуль (например /modules/pomodoro)
  if (!isModulesListPage) {
    return <Outlet />;
  }

  // Показываем список модулей только на /modules
  return (
    <div className={cn(styles.modulePage, "animate__animated animate__fadeIn")}>
      <div className={styles.moduleHeader}>
        <h1 className={styles.title}>{t("modules.title")}</h1>
        <p className={styles.subtitle}>{t("modules.subtitle")}</p>
      </div>

      <div className={styles.modulesGrid}>
        {modules.map((module, index) => (
          <div
            key={module.id}
            className={cn(styles.moduleCard, `module-item-${index}`)}
            onClick={() => handleModuleClick(module.route)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.moduleIcon} style={{ background: module.gradient }}>
              {module.icon}
            </div>
            <div className={styles.moduleContent}>
              <h3 className={styles.moduleName}>{module.name}</h3>
              <p className={styles.moduleDescription}>{module.description}</p>
            </div>
            <div className={styles.moduleArrow}>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ModulePage);
