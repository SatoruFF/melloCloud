import React, { memo, useState, useCallback, useEffect, useMemo } from "react";
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
import type { NotesViewFilter } from "../../../entities/note/model/api/noteApi";
import { NoteCard } from "../../../entities/note";
import styles from "./notesList.module.scss";
import { useTranslation } from "react-i18next";

interface NotesListProps {
  view: NotesViewFilter;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const NotesList = ({ view, selectedTag, onTagSelect }: NotesListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const getNotesParams = useMemo(() => {
    const viewParam = view === "trash" ? "trash" : view === "starred" ? "starred" : "all";
    const tagParam = view === "tags" ? selectedTag ?? undefined : undefined;
    return { view: viewParam, tag: tagParam };
  }, [view, selectedTag]);

  const { data: notes = [], isLoading, error } = useGetNotesQuery(getNotesParams);
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [_, { isLoading: isCreating }] = useCreateNoteMutation();

  const { data: searchResults } = useSearchNotesQuery(debouncedSearch, {
    skip: !debouncedSearch.trim(),
  });

  const uniqueTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => (n.tags ?? []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [notes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMoveToTrash = useCallback(
    async (noteId: number) => {
      try {
        await updateNote({ noteId: String(noteId), isRemoved: true }).unwrap();
        message.success(t("notes.movedToTrash") ?? "Заметка перемещена в корзину");
      } catch (err) {
        message.error(t("notes.updateFailed"));
      }
    },
    [updateNote, t]
  );

  const handleRestore = useCallback(
    async (noteId: number) => {
      try {
        await updateNote({ noteId: String(noteId), isRemoved: false }).unwrap();
        message.success(t("notes.restored") ?? "Заметка восстановлена");
      } catch (err) {
        message.error(t("notes.updateFailed"));
      }
    },
    [updateNote, t]
  );

  const handleDeletePermanently = useCallback(
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
  const isTrashView = view === "trash";

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

        {view === "tags" && uniqueTags.length > 0 && (
          <div className={cn(styles.tagFilter)}>
            <span className={cn(styles.tagFilterLabel)}>{t("notes.filterByTag") ?? "Тег:"}</span>
            <div className={cn(styles.tagChips)}>
              <button
                type="button"
                className={cn(styles.tagChip, { [styles.tagChipActive]: selectedTag === null })}
                onClick={() => onTagSelect(null)}
              >
                {t("notes.all") ?? "Все"}
              </button>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={cn(styles.tagChip, { [styles.tagChipActive]: selectedTag === tag })}
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className={cn(styles.emptyState)}>
            <h2>{t("notes.loading")}</h2>
          </div>
        ) : notes.length === 0 ? (
          <div className={cn(styles.emptyState)}>
            <h2>
              {isTrashView
                ? t("notes.trashEmpty") ?? "Корзина пуста"
                : view === "starred"
                  ? t("notes.starredEmpty") ?? "Нет избранных заметок"
                  : view === "tags"
                    ? t("notes.noTags") ?? "Нет заметок с тегами"
                    : t("notes.empty")}
            </h2>
            <p>
              {isTrashView
                ? t("notes.trashEmptyHint") ?? "Удалённые заметки появятся здесь"
                : view === "starred"
                  ? t("notes.starredEmptyHint") ?? "Отметьте заметки звёздочкой"
                  : view === "tags"
                    ? t("notes.tagsEmptyHint") ?? "Добавьте теги к заметкам"
                    : t("notes.createFirstNote")}
            </p>
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
                  onDelete={handleMoveToTrash}
                  onToggleStar={handleToggleStar}
                  isDeleting={isDeleting}
                  isTrashView={isTrashView}
                  onRestore={isTrashView ? handleRestore : undefined}
                  onDeletePermanently={isTrashView ? handleDeletePermanently : undefined}
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
