import { Button } from "antd";
import { Pencil } from "lucide-react";
import { memo } from "react";
import styles from "./new-chat-button.module.scss";

interface Props {
  onClick: () => void;
}

const NewChatButton: React.FC<Props> = ({ onClick }) => {
  return (
    <Button
      type="primary"
      //   shape="circle"
      icon={<Pencil size={18} />}
      onClick={onClick}
      className={styles.floatingButton}
    />
  );
};

export default memo(NewChatButton);
