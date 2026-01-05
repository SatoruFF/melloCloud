import React, { memo, useRef, useState, useCallback, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import { message, Modal } from "antd";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useCreateNoteMutation,
  useSearchNotesQuery,
} from "../../../entities/note/model/api/noteApi";
import styles from "./notesList.module.scss";
import { useTranslation } from "react-i18next";

const NotesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const virtuosoRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // API hooks
  const { data: notes = [], isLoading, error } = useGetNotesQuery();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();

  // Search query with skip option
  const { data: searchResults } = useSearchNotesQuery(debouncedSearch, {
    skip: !debouncedSearch.trim(),
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeleteNote = useCallback(
    async (noteId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      Modal.confirm({
        title: t("notes.deleteConfirm"),
        okText: t("common.yes"),
        cancelText: t("common.no"),
        onOk: async () => {
          try {
            await deleteNote(noteId).unwrap();
            message.success(t("notes.deleteSuccess"));
          } catch (err) {
            message.error(t("notes.deleteFailed"));
            console.error("Delete error:", err);
          }
        },
      });
    },
    [deleteNote, t]
  );

  const handleCreateNote = useCallback(() => {
    navigate("/notes/new");
  }, [navigate]);

  const handleNoteClick = useCallback(
    (noteId: string) => {
      navigate(`/notes/${noteId}`);
    },
    [navigate]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const extractTextContent = (content: any): string => {
    if (!content) return "";

    if (typeof content === "string") return content;

    if (Array.isArray(content)) {
      return content
        .map((block) => {
          if (typeof block === "string") return block;
          if (block.content) {
            if (typeof block.content === "string") return block.content;
            if (Array.isArray(block.content)) {
              return block.content.map((item: any) => (typeof item === "string" ? item : item.text || "")).join("");
            }
          }
          return block.text || "";
        })
        .join(" ");
    }

    return "";
  };

  // Use search results if searching, otherwise use all notes
  const displayNotes = debouncedSearch.trim() ? searchResults || [] : notes;

  const filteredNotes = displayNotes;

  const getRandomColor = (id: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181", "#AA96DA", "#FCBAD3"];
    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const NoteCard = ({ note }: { note: any }) => {
    const color = getRandomColor(note.id);
    const textContent = extractTextContent(note.content);

    return (
      <div
        className={cn(styles.noteCard)}
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderLeft: `4px solid ${color}`,
        }}
        onClick={() => handleNoteClick(note.id)}
      >
        <div className={cn(styles.noteHeader)}>
          <h3>{note.title || t("notes.untitled")}</h3>
          <div className={cn(styles.noteActions)}>
            <button
              className={cn(styles.actionBtn, styles.deleteBtn)}
              onClick={(e) => handleDeleteNote(note.id, e)}
              title="Delete"
              disabled={isDeleting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <p className={cn(styles.noteContent)}>
          {textContent.slice(0, 120)}
          {textContent.length > 120 && "..."}
        </p>
        <div className={cn(styles.noteFooter)}>
          <span className={cn(styles.noteDate)}>{formatDate(note.updatedAt)}</span>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className={cn(styles.notesListWrapper)}>
        <div className={cn(styles.notesContainer)}>
          <div className={cn(styles.emptyState)}>
            <h2>Error loading notes</h2>
            <p>Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.notesListWrapper)}>
      <div className={cn(styles.notesContainer)}>
        <div className={cn(styles.header)}>
          <div className={cn(styles.headerContent)}>
            <h1>{t("notes.title")}</h1>
            <p>
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <button className={cn(styles.createBtn)} onClick={handleCreateNote} disabled={isCreating}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("notes.createNew")}
          </button>
        </div>

        <div className={cn(styles.searchBar)}>
          <svg
            className={cn(styles.searchIcon)}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className={cn(styles.searchInput)}
            placeholder={t("notes.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className={cn(styles.emptyState)}>
            <h2>Loading...</h2>
          </div>
        ) : notes.length === 0 ? (
          <div className={cn(styles.emptyState)}>
            <h2>{t("notes.empty")}</h2>
            <p>Create your first note to get started</p>
            <button className={cn(styles.createBtn)} onClick={handleCreateNote} disabled={isCreating}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t("notes.createNew")}
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={cn(styles.emptyState)}>
            <h2>No notes found</h2>
            <p>Try a different search term</p>
          </div>
        ) : (
          <div className={cn(styles.notesGridContainer)}>
            <Virtuoso
              ref={virtuosoRef}
              totalCount={filteredNotes.length}
              itemContent={(index) => {
                const note = filteredNotes[index];
                return <NoteCard note={note} />;
              }}
              components={{
                List: React.forwardRef(({ style, children }, ref) => (
                  <div ref={ref} style={style} className={cn(styles.virtuosoGrid)}>
                    {children}
                  </div>
                )),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(NotesList);
