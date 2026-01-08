import React, { useState } from "react";
import cn from "classnames";
import { Layout, Button, Splitter } from "antd";
import { useMediaQuery } from "react-responsive";

import { Messages } from "../../../widgets/messages";
import { ChatList } from "../../../widgets/chatList/index";
import styles from "./chats.module.scss";
import { useTranslation } from "react-i18next";

// TODO: вынести в глобал конфиги
const MOBILE_BREAKPOINT = 1224; // px

const Chats: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: MOBILE_BREAKPOINT });
  const [mobileView, setMobileView] = useState<"chats" | "messages">("chats");

  if (!isMobile) {
    // Десктоп: рендерим Splitter с двумя панелями
    return (
      <Layout className={cn(styles.chatContainer)}>
        <Splitter className={cn(styles.windowsSplitter)}>
          <Splitter.Panel defaultSize="20%" min="20%" max="40%">
            <ChatList />
          </Splitter.Panel>
          <Splitter.Panel defaultSize="80%" min="60%" max="80%">
            <Messages />
          </Splitter.Panel>
        </Splitter>
      </Layout>
    );
  }

  // Мобильная версия — переключение между списком и сообщениями
  return (
    <Layout className={cn(styles.chatContainer, styles.mobileContainer)}>
      <div className={styles.mobileHeader}>
        <Button
          type={mobileView === "chats" ? "primary" : "default"}
          onClick={() => setMobileView("chats")}
          style={{ marginRight: 8 }}
        >
          {t("chats.chats")}
        </Button>
        <Button
          type={mobileView === "messages" ? "primary" : "default"}
          onClick={() => setMobileView("messages")}
          disabled={mobileView === "messages" /* Можно сюда добавить логику блокировки если нет currentChat */}
        >
          {t("chats.messages")}
        </Button>
      </div>
      <div className={styles.mobileContent}>
        {mobileView === "chats" && <ChatList />}
        {mobileView === "messages" && <Messages />}
      </div>
    </Layout>
  );
};

export default React.memo(Chats);
