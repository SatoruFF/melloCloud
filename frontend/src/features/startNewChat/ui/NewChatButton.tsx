import { Button } from "antd";
import { MessageSquarePlus } from "lucide-react";
import { memo } from "react";
import styles from "./new-chat-button.module.scss";

interface Props {
  onClick: () => void;
}

const NewChatButton: React.FC<Props> = ({ onClick }) => {
  return (
    <Button
      type="text"
      icon={<MessageSquarePlus className={styles.addIcon} />}
      size="large"
      onClick={onClick}
      className={styles.floatingButton}
    />
  );
};

export default memo(NewChatButton);
