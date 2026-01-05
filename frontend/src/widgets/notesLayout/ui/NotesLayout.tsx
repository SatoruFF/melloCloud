import React, { type FC, type ReactNode } from "react";
import NotesSidebar from "../../notesSidebar/ui/NotesSidebar";
import styles from "../styles/notesLayout.module.scss";
import cn from "classnames";

interface NotesLayoutProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  currentNoteId?: string;
  onCreateNote: () => void;
  children: ReactNode;
}

export const NotesLayout: FC<NotesLayoutProps> = ({
  collapsed,
  toggleCollapsed,
  currentNoteId,
  onCreateNote,
  children,
}) => {
  return (
    <div className={cn(styles.notesLayout)}>
      <NotesSidebar
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        currentNoteId={currentNoteId}
        onCreateNote={onCreateNote}
      />
      <div className={cn(styles.content)}>{children}</div>
    </div>
  );
};
