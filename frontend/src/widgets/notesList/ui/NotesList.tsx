import React, { memo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import { message } from "antd";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useUpdateNoteMutation,
  useCreateNoteMutation,
  useSearchNotesQuery,
} from "../../../entities/note/model/api/noteApi";
import { NoteCard } from "../../../entities/note";
import styles from "./notesList.module.scss";
import { useTranslation } from "react-i18next";

const NotesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: notes = [], isLoading, error } = useGetNotesQuery();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [_, { isLoading: isCreating }] = useCreateNoteMutation();

  const { data: searchResults } = useSearchNotesQuery(debouncedSearch, {
    skip: !debouncedSearch.trim(),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeleteNote = useCallback(
    async (noteId: number) => {
      try {
        await deleteNote(String(noteId)).unwrap();
        message.success(t("notes.deleteSuccess"));
      } catch (err) {
        message.error(t("notes.deleteFailed"));
      }
    },
    [deleteNote, t]
  );

  const handleToggleStar = useCallback(
    async (noteId: number, isStarred: boolean) => {
      try {
        await updateNote({
          noteId: String(noteId),
          isStarred,
        }).unwrap();
      } catch (err) {
        message.error(t("notes.updateFailed"));
      }
    },
    [updateNote, t]
  );

  const handleCreateNote = useCallback(() => {
    navigate("/notes/new");
  }, [navigate]);

  const displayNotes = debouncedSearch.trim() ? searchResults || [] : notes;

  if (error) {
    return (
      <div className={cn(styles.notesListWrapper)}>
        <div className={cn(styles.notesContainer)}>
          <div className={cn(styles.emptyState)}>
            <h2>{t("notes.errorLoading")}</h2>
            <p>{t("notes.tryAgain")}</p>
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
              {displayNotes.length}{" "}
              {displayNotes.length === 1 ? t("notes.noteCount.singular") : t("notes.noteCount.plural")}
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
            <h2>{t("notes.loading")}</h2>
          </div>
        ) : notes.length === 0 ? (
          <div className={cn(styles.emptyState)}>
            <h2>{t("notes.empty")}</h2>
            <p>{t("notes.createFirstNote")}</p>
            <button className={cn(styles.createBtn)} onClick={handleCreateNote} disabled={isCreating}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t("notes.createNew")}
            </button>
          </div>
        ) : displayNotes.length === 0 ? (
          <div className={cn(styles.emptyState)}>
            <h2>{t("notes.noResults")}</h2>
            <p>{t("notes.tryDifferentSearch")}</p>
          </div>
        ) : (
          <div className={cn(styles.notesGridContainer)}>
            <div className={cn(styles.notesGrid)}>
              {displayNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDeleteNote}
                  onToggleStar={handleToggleStar}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(NotesList);
