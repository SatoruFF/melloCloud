import { Button } from "antd";
import { ArrowLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useGetBoardQuery } from "../../../entities/board";
import { ShareModal } from "../../../features/sharing";
import { ResourceType } from "../../../entities/sharing";
import Kanban from "./Kanban";
import styles from "./kanban.module.scss";

interface KanbanBoardWrapperProps {
  boardId: number;
  onBackToBoards: () => void;
}

export const KanbanBoardWrapper = ({ boardId, onBackToBoards }: KanbanBoardWrapperProps) => {
  const { t } = useTranslation();
  const { data: board, isLoading: boardLoading } = useGetBoardQuery(boardId);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className={cn(styles.boardHeader)}>
        <Button
          type="text"
          icon={<ArrowLeft size={18} />}
          onClick={onBackToBoards}
          className={cn(styles.boardHeaderBack)}
        >
          {t("planner.boards.backToList")}
        </Button>
        <span className={cn(styles.boardHeaderTitle)}>
          {boardLoading ? "…" : board?.title ?? ""}
        </span>
        {board && (
          <Button
            type="default"
            icon={<Share2 size={16} />}
            onClick={() => setShareOpen(true)}
            className={cn(styles.boardHeaderShare)}
          >
            {t("planner.boards.share")}
          </Button>
        )}
      </div>
      <Kanban boardId={boardId} />
      {board && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          resourceType={ResourceType.KANBAN_BOARD}
          resourceId={boardId}
          resourceName={board.title}
        />
      )}
    </>
  );
};
