import { Modal, Input, List, Avatar, Empty } from "antd";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../shared";
import { useSearchUsersQuery } from "../../../entities/user/model/api/user";
import styles from "./new-chat-modal.module.scss"; // создадим красивый файл стилей

interface Props {
  open: boolean;
  onClose: () => void;
}

const NewChatModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [userQuery, setUserQuery] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const debouncedSearch = useDebounce((value: string) => setSearch(value), 300);

  const handleUserSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUserQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const { data: users = [], isLoading } = useSearchUsersQuery(search, {
    skip: search.length < 2,
  });

  const handleUserSelect = (user: any) => {
    console.log("Выбран пользователь:", user);
    onClose();
  };

  return (
    <Modal open={open} centered onCancel={onClose} onOk={onClose} title={t("chats.new-chat")} className={styles.modal}>
      <Input
        placeholder={t("chats.search-users")}
        value={userQuery}
        onChange={handleUserSearch}
        className={styles.input}
      />

      <div className={styles.userListWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : users.length === 0 ? (
          <Empty description={t("chats.no-users-found")} />
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => (
              <List.Item className={styles.userItem} onClick={() => handleUserSelect(user)}>
                <List.Item.Meta
                  avatar={
                    <Avatar src={user.avatar} className={styles.avatar}>
                      {user.userName[0].toUpperCase()}
                    </Avatar>
                  }
                  title={user.userName}
                  description={user.email}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <Input.TextArea
        placeholder={t("chats.write-message")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className={styles.messageArea}
      />
    </Modal>
  );
};

export default memo(NewChatModal);
