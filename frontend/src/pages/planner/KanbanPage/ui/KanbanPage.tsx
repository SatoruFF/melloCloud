import { useSearchParams } from "react-router-dom";
import { KanbanBoard, BoardList } from "../../../../widgets/Kanban";

const KanbanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const boardIdParam = searchParams.get("boardId");
  const boardId = boardIdParam ? Number(boardIdParam) : null;

  const handleSelectBoard = (id: number) => {
    setSearchParams({ boardId: String(id) });
  };

  if (boardId != null && !Number.isNaN(boardId)) {
    return <KanbanBoard boardId={boardId} onBackToBoards={() => setSearchParams({})} />;
  }

  return <BoardList onSelectBoard={handleSelectBoard} />;
};

export default KanbanPage;
