// @ts-nocheck
import { Modal, Input, List, Avatar, Empty, Tabs, Checkbox, Button } from "antd";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../shared";
import { useSearchUsersQuery } from "../../../entities/user/model/api/user";
import { useCreateGroupChatMutation, useGetChatsQuery } from "../../../entities/chat/model/api/chatApi";
import { setCurrentChat } from "../../../entities/chat/model/slice/chatSlice";
import { useAppDispatch, useAppSelector } from "../../../app/store/store";
import { getUserSelector } from "../../../entities/user";
import styles from "./new-chat-modal.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabKey = "private" | "group";

const NewChatModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(getUserSelector);
  const [activeTab, setActiveTab] = useState<TabKey>("private");
  const [userQuery, setUserQuery] = useState("");
  const [search, setSearch] = useState("");
  const [groupTitle, setGroupTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const [createGroupChat, { isLoading: isCreating }] = useCreateGroupChatMutation();
  const { refetch: refetchChats } = useGetChatsQuery();

  const handleUserSelect = useCallback(
    (user: { id: number; userName: string; avatar?: string }) => {
      if (activeTab === "private") {
        dispatch(
          setCurrentChat({
            id: null,
            receiver: { id: user.id, userName: user.userName, avatar: user.avatar },
            isGroup: false,
          })
        );
        onClose();
      } else {
        setSelectedIds((prev) =>
          prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id]
        );
      }
    },
    [activeTab, dispatch, onClose]
  );

  const handleCreateGroup = useCallback(async () => {
    const title = groupTitle.trim();
    if (!title || selectedIds.length === 0) return;
    try {
      const chat = await createGroupChat({ title, participantIds: selectedIds }).unwrap();
      dispatch(
        setCurrentChat({
          id: chat.id,
          title: chat.title ?? title,
          isGroup: true,
          receiver: null,
        })
      );
      await refetchChats();
      setGroupTitle("");
      setSelectedIds([]);
      onClose();
    } catch (e) {
      console.error("Create group failed", e);
    }
  }, [groupTitle, selectedIds, createGroupChat, dispatch, refetchChats, onClose]);

  const handleClose = useCallback(() => {
    setGroupTitle("");
    setSelectedIds([]);
    setActiveTab("private");
    onClose();
  }, [onClose]);

  const filteredUsers = users.filter((u) => u.id !== currentUser?.id);

  return (
    <Modal
      open={open}
      centered
      onCancel={handleClose}
      footer={null}
      title={t("chats.new-chat")}
      className={styles.modal}
      width={420}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as TabKey)}
        items={[
          { key: "private", label: t("chats.private-chat") ?? "Личный чат" },
          { key: "group", label: t("chats.group-chat") ?? "Групповой чат" },
        ]}
      />

      <Input
        placeholder={t("chats.search-users")}
        value={userQuery}
        onChange={handleUserSearch}
        className={styles.input}
      />

      {activeTab === "group" && (
        <>
          <Input
            placeholder={t("chats.group-name") ?? "Название группы"}
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            className={styles.input}
            style={{ marginTop: 8 }}
          />
          {selectedIds.length > 0 && (
            <div className={styles.selectedCount}>
              {t("chats.selected") ?? "Выбрано"}: {selectedIds.length}
            </div>
          )}
        </>
      )}

      <div className={styles.userListWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : filteredUsers.length === 0 ? (
          <Empty description={t("chats.no-users-found")} />
        ) : (
          <List
            dataSource={filteredUsers}
            renderItem={(user) => {
              const checked = activeTab === "group" && selectedIds.includes(user.id);
              return (
                <List.Item
                  className={styles.userItem}
                  onClick={() => handleUserSelect(user)}
                  extra={
                    activeTab === "group" ? (
                      <Checkbox checked={checked} onChange={() => handleUserSelect(user)} />
                    ) : null
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={user.avatar} className={styles.avatar}>
                        {user.userName?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                    }
                    title={user.userName}
                    description={user.email}
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>

      {activeTab === "group" && (
        <Button
          type="primary"
          block
          disabled={!groupTitle.trim() || selectedIds.length === 0 || isCreating}
          loading={isCreating}
          onClick={handleCreateGroup}
          className={styles.createGroupBtn}
        >
          {t("chats.create-group") ?? "Создать группу"}
        </Button>
      )}
    </Modal>
  );
};

export default memo(NewChatModal);
