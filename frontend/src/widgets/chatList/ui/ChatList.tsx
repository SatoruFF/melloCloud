import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, List } from "antd";
import cn from "classnames";
import { Star } from "lucide-react"; // <-- импорт иконки

import styles from "./chat-list.module.scss";
import { AppSkeleton, Search } from "../../../shared";
import { useGetChatsQuery } from "../../../entities/chat/model/api/chatApi";
import { useSearchUsersQuery } from "../../../entities/user/model/api/user";
import { NewChatButton, NewChatModal } from "../../../features/startNewChat";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { setCurrentChat } from "../../../entities/chat/model/slice/chatSlice";
import { getCurrentChat } from "../../../entities/chat/model/selector/getChats";
import { getUserSelector } from "../../../entities/user"; // <-- получаем currentUser
import { useTranslation } from "react-i18next"; // <-- i18n

const ChatList: React.FC = () => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const dispatch = useAppDispatch();
  const currentChat = useAppSelector(getCurrentChat);
  const currentUser = useAppSelector(getUserSelector); // <-- текущий пользователь
  const currentChatId = currentChat?.id;

  const { data: chats = [], isLoading } = useGetChatsQuery();
  const { data: mentionResults = [] } = useSearchUsersQuery(mentionSearch, {
    skip: mentionSearch.length < 1,
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const match = value.match(/@(\w{1,})$/);
    setMentionSearch(match ? match[1] : "");
  }, []);

  const filteredChats = useMemo(
    () => chats.filter((chat) => (chat.title || "").toLowerCase().includes(search.toLowerCase())),
    [chats, search]
  );
  const insertMention = useCallback(
    (userName: string) => {
      const user = mentionResults.find((u) => u.userName === userName);
      if (!user) return;

      const newSearch = search.replace(/@(\w{1,})$/, `@${userName} `);
      setSearch(newSearch);
      setMentionSearch("");

      const existingChat = chats.find((chat) => chat.receiver?.id === user.id && !chat.isGroup);

      dispatch(
        setCurrentChat({
          id: existingChat?.id ?? null,
          receiver: {
            id: user.id,
            userName: user.userName,
          },
        })
      );
    },
    [search, mentionResults, dispatch, chats]
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

  return (
    <div className={cn(styles.usersListWrapper)}>
      <NewChatButton onClick={() => setModalOpen(true)} />
      <div className={styles.searchWrapper}>
        <Search value={search} onSearch={handleSearch} className={styles.searchChats} />
        {mentionResults.length > 0 && (
          <div className={styles.mentionDropdown}>
            {mentionResults.map((user) => (
              <div key={user.id} className={styles.mentionItem} onClick={() => insertMention(user.userName)}>
                @{user.userName}
              </div>
            ))}
          </div>
        )}
      </div>

      {mentionResults.length > 0 && (
        <div className={styles.mentionResults}>
          {mentionResults.map((user) => (
            <div key={user.id} className={styles.mentionItem} onClick={() => insertMention(user.userName)}>
              @{user.userName}
            </div>
          ))}
        </div>
      )}

      <List
        dataSource={filteredChats}
        renderItem={(chat) => {
          // Проверяем, чат ли с самим собой
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
                  })
                );
              }}
            >
              <List.Item.Meta
                avatar={
                  isSelfChat ? (
                    <Star className={styles.favoriteIcon} /> // иконка вместо аватара
                  ) : (
                    <Avatar src={chat.receiver?.avatar}>{title[0]}</Avatar>
                  )
                }
                title={title}
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
