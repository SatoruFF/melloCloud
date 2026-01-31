import { Button, Card, Empty, Input, List, message, Spin } from "antd";
import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { useGetBoardsQuery, useCreateBoardMutation } from "../../../entities/board";
import styles from "./kanban.module.scss";

interface BoardListProps {
  onSelectBoard: (boardId: number) => void;
}

export const BoardList = ({ onSelectBoard }: BoardListProps) => {
  const { t } = useTranslation();
  const { data: boards = [], isLoading } = useGetBoardsQuery();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = async () => {
    const title = newBoardTitle.trim() || t("planner.boards.defaultTitle");
    try {
      const board = await createBoard({ title }).unwrap();
      setNewBoardTitle("");
      setShowCreate(false);
      message.success(t("planner.boards.created"));
      onSelectBoard(board.id);
    } catch (err: any) {
      message.error(err?.data?.message || t("planner.boards.createFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className={cn(styles.kanbanContainer, styles.boardListLoading)}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={cn(styles.kanbanContainer)}>
      <div className={cn(styles.boardListWrap)}>
        <h2 className={cn(styles.boardListTitle)}>{t("planner.boards.title")}</h2>
        {boards.length === 0 && !showCreate ? (
          <div className={cn(styles.boardListEmpty)}>
            <Empty
              image={<LayoutGrid size={64} />}
              description={t("planner.boards.empty")}
            >
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowCreate(true)}
              size="large"
            >
              {t("planner.boards.createFirst")}
            </Button>
          </Empty>
          </div>
        ) : (
          <>
            {boards.length > 0 && (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={boards}
                renderItem={(board) => (
                  <List.Item>
                    <Card
                      hoverable
                      className={cn(styles.boardCard)}
                      onClick={() => onSelectBoard(board.id)}
                    >
                      <div className={cn(styles.boardCardContent)}>
                        <LayoutGrid size={24} />
                        <span className={cn(styles.boardCardTitle)}>{board.title}</span>
                        {board.isOwner === false && (
                          <span className={cn(styles.boardCardBadge)}>{t("planner.boards.shared")}</span>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
            {showCreate ? (
              <Card className={cn(styles.addColumnForm, styles.boardListCreateForm)}>
                <Input
                  placeholder={t("planner.boards.titlePlaceholder")}
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onPressEnter={handleCreate}
                  autoFocus
                  size="large"
                />
                <div className={cn(styles.boardListCreateActions)}>
                  <Button type="primary" onClick={handleCreate} loading={isCreating}>
                    {t("planner.boards.create")}
                  </Button>
                  <Button onClick={() => { setShowCreate(false); setNewBoardTitle(""); }}>
                    {t("planner.kanban.actions.cancel")}
                  </Button>
                </div>
              </Card>
            ) : (
              <Button
                type="dashed"
                icon={<Plus size={16} />}
                onClick={() => setShowCreate(true)}
                className={cn(styles.boardListNewBoardBtn)}
                block
              >
                {t("planner.boards.newBoard")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
