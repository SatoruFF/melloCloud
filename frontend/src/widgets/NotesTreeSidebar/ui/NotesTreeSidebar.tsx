import React, { memo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Input, Spin, Empty } from "antd";
import { Search, FileText, Plus, ArrowLeft, StickyNote } from "lucide-react";
import { useGetNotesQuery } from "../../../entities/note/model/api/noteApi";
import { useTranslation } from "react-i18next";
import styles from "../styles/notesTreeSidebar.module.scss";
import cn from "classnames";
import { NOTES_ROUTE } from "../../../shared/consts/routes";

const { Sider } = Layout;

interface NotesTreeSidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  currentNoteId?: string;
  onCreateNote: () => void;
}

const NotesTreeSidebar: FC<NotesTreeSidebarProps> = ({ collapsed, toggleCollapsed, currentNoteId, onCreateNote }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: notes = [], isLoading } = useGetNotesQuery();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredNotes = notes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return t("notes.today");
    if (days === 1) return t("notes.yesterday");
    if (days < 7) return t("notes.daysAgo", { count: days });

    return date.toLocaleDateString();
  };

  const handleReturn = () => {
    navigate(NOTES_ROUTE);
  };

  return (
    <Sider
      width={280}
      collapsed={collapsed}
      collapsible
      onCollapse={toggleCollapsed}
      collapsedWidth={60}
      className={styles.sidebar}
    >
      {!collapsed && (
        <>
          {/* Header with Create Button */}
          <div className={styles.header}>
            <button className={styles.backToListBtn} onClick={handleReturn}>
              <ArrowLeft size={18} />
              <span>{t("notes.backToList")}</span>
            </button>
            <button className={styles.createBtn} onClick={onCreateNote}>
              <Plus size={18} />
              <span>{t("notes.createNew")}</span>
            </button>
          </div>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <div className={styles.searchInputWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t("notes.searchNotes")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Notes List */}
          <div className={styles.notesList}>
            {isLoading ? (
              <div className={styles.loading}>
                <Spin size="small" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className={styles.empty}>
                <StickyNote size={32} className={styles.emptyIcon} />
                <p>{t("notes.noNotes")}</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(styles.noteItem, {
                    [styles.active]: currentNoteId === String(note.id),
                  })}
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <FileText size={16} className={styles.noteIcon} />
                  <div className={styles.noteInfo}>
                    <div className={styles.noteTitle}>{note.title || t("notes.untitled")}</div>
                    <div className={styles.noteDate}>{formatDate(note.updatedAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {collapsed && (
        <div className={styles.collapsedActions}>
          <button className={styles.iconBtn} onClick={handleReturn} title={t("notes.backToList")}>
            <ArrowLeft size={20} />
          </button>
          <button className={styles.iconBtn} onClick={onCreateNote} title={t("notes.createNew")}>
            <Plus size={20} />
          </button>
        </div>
      )}
    </Sider>
  );
};

export default memo(NotesTreeSidebar);
