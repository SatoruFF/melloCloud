import React, { type FC, type ReactNode } from "react";
import { NotesTreeSidebar } from "../../NotesTreeSidebar";
import styles from "../styles/notesLayout.module.scss";
import cn from "classnames";

interface NotesLayoutProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  currentNoteId?: string;
  onCreateNote: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  children: ReactNode;
}

export const NotesLayout: FC<NotesLayoutProps> = ({
  collapsed,
  toggleCollapsed,
  currentNoteId,
  onCreateNote,
  isFullscreen = false,
  children,
}) => {
  return (
    <div className={cn(styles.notesLayout, { [styles.fullscreen]: isFullscreen })}>
      {!isFullscreen && (
        <NotesTreeSidebar
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          currentNoteId={currentNoteId}
          onCreateNote={onCreateNote}
        />
      )}
      <div className={cn(styles.content)}>{children}</div>
    </div>
  );
};
