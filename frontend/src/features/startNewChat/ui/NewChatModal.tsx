import { Modal, Input } from "antd";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
}

const NewChatModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [userQuery, setUserQuery] = useState("");
  const [message, setMessage] = useState("");

  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} title={t("chats.new-chat")}>
      <Input
        placeholder={t("chats.search-users")}
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Input.TextArea
        placeholder={t("chats.write-message")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />
    </Modal>
  );
};

export default memo(NewChatModal);
