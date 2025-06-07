import cn from "classnames";
import type React from "react";

import { Layout, Splitter } from "antd";

import { Messages } from "../../../widgets/messages";
import { ChatList } from "../../../widgets/chatList/index";
import styles from "./chats.module.scss";
import { memo } from "react";

const Chats: React.FC = () => {
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
};
export default memo(Chats);
