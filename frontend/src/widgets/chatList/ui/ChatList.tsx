import type React from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { Avatar, List, Alert, Empty } from "antd";
import cn from "classnames";
import { Star } from "lucide-react";

import styles from "./chat-list.module.scss";
import { AppSkeleton, Search } from "../../../shared";
import { useGetChatsQuery } from "../../../entities/chat/model/api/chatApi";
import { useSearchUsersQuery } from "../../../entities/user/model/api/user";
import { NewChatButton, NewChatModal } from "../../../features/startNewChat";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { setCurrentChat } from "../../../entities/chat/model/slice/chatSlice";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import { getUserSelector } from "../../../entities/user";
import { useTranslation } from "react-i18next";

const ChatList: React.FC = () => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);

  const dispatch = useAppDispatch();

  const currentChat = useAppSelector(getCurrentChat);
  const currentUser = useAppSelector(getUserSelector);
  const currentChatId = currentChat?.id;

  const { data: chats = [], isLoading, error: chatsError } = useGetChatsQuery();
  const { data: mentionResults = [], error: mentionError } = useSearchUsersQuery(mentionSearch, {
    skip: mentionSearch.length < 1,
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const match = value.match(/@(\w{1,})$/);
    if (match) {
      setMentionSearch(match[1]);
      setShowMentionDropdown(true);
    } else {
      setMentionSearch("");
      setShowMentionDropdown(false);
    }
  }, []);

  const filteredChats = useMemo(
    () => chats.filter((chat) => (chat.title || "").toLowerCase().includes(search.toLowerCase())),
    [chats, search],
  );

  const insertMention = useCallback(
    (userName: string, userId: number) => {
      setSearch("");
      setMentionSearch("");
      setShowMentionDropdown(false);

      const existingChat = chats.find((chat) => chat.receiver?.id === userId && !chat.isGroup);

      dispatch(
        setCurrentChat({
          id: existingChat?.id ?? null,
          receiver: {
            id: userId,
            userName,
          },
        }),
      );
    },
    [search, chats, dispatch],
  );

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 6 }).map((_, idx) => (
          <List.Item key={idx}>
            <AppSkeleton avatar title={false} active />
          </List.Item>
        ))}
      </div>
    );
  }

  if (chatsError) {
    return (
      <div className={cn(styles.usersListWrapper)}>
        <Alert
          message={t("chats.error-title") || "Error"}
          description={t("chats.error-loading") || "Failed to load chats. Please try again."}
          type="error"
          showIcon
          style={{ margin: "16px" }}
        />
      </div>
    );
  }

  return (
    <div className={cn(styles.usersListWrapper)}>
      <NewChatButton onClick={() => setModalOpen(true)} />

      <div className={styles.searchWrapper}>
        <Search
          value={search}
          onSearch={handleSearch}
          className={styles.searchChats}
          placeholder={t("chats.search-placeholder")}
        />
        {showMentionDropdown && mentionResults.length > 0 && (
          <div className={styles.mentionDropdown}>
            {mentionResults.map((user) => (
              <div key={user.id} className={styles.mentionItem} onClick={() => insertMention(user.userName, user.id)}>
                @{user.userName}
              </div>
            ))}
          </div>
        )}
        {showMentionDropdown && mentionError && (
          <div className={styles.mentionDropdown}>
            <Alert message={t("chats.error-search") || "Search error"} type="error" showIcon size="small" />
          </div>
        )}
      </div>

      <List
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="" />,
        }}
        dataSource={filteredChats}
        renderItem={(chat) => {
          const isSelfChat = chat.receiver?.id === currentUser?.id;
          const title = isSelfChat
            ? t("chats.favorite")
            : chat.title ||
              (chat.isGroup ? `Группа #${chat.id}` : chat.receiver?.userName || `Пользователь #${chat.id}`);
          const isActive = chat.id === currentChatId;

          return (
            <List.Item
              className={cn(styles.chatItem, { [styles.active]: isActive })}
              onClick={() => {
                dispatch(
                  setCurrentChat({
                    id: chat.id || null,
                    receiver: {
                      id: chat.receiver?.id || null,
                      userName: chat.receiver?.userName || null,
                    },
                  }),
                );
              }}
            >
              <List.Item.Meta
                avatar={
                  isSelfChat ? (
                    <Star className={styles.favoriteIcon} />
                  ) : (
                    <Avatar className={cn(styles.userAvatar)} src={chat.receiver?.avatar}>
                      {title[0] || "U"}
                    </Avatar>
                  )
                }
                title={isSelfChat ? t("chats.favorite") : chat.receiver?.userName || "unknown"}
                description={title}
              />
            </List.Item>
          );
        }}
      />

      <NewChatModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default memo(ChatList);
