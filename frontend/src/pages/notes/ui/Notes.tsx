import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NotesLayout } from "../../../widgets/notesLayout";
import { CollaborativeNoteEditor } from "../../../widgets/noteEditor";
import { NotesList } from "../../../widgets/notesList";
import {
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
} from "../../../entities/note/model/api/noteApi";
import type { NotesViewFilter } from "../../../entities/note/model/api/noteApi";
import { notification, Button } from "antd";
import { useTranslation } from "react-i18next";
import { NotesSidebar } from "../../../widgets/notesSidebar";

import styles from "./notes.module.scss";

const Notes = () => {
  const { t } = useTranslation();
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [notesView, setNotesView] = useState<NotesViewFilter>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentNoteTitle, setCurrentNoteTitle] = useState("");
  const [api, contextHolder] = notification.useNotification();

  const {
    data: note,
    isLoading,
    error,
  } = useGetNoteQuery(noteId!, {
    skip: !noteId || noteId === "new",
  });

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();

  useEffect(() => {
    if (note) {
      setCurrentNoteTitle(note.title);
    } else if (noteId === "new") {
      setCurrentNoteTitle("");
    }
  }, [note, noteId]);

  const handleSave = useCallback(
    async (content: any) => {
      try {
        if (noteId && noteId !== "new") {
          await updateNote({
            noteId,
            content,
            title: currentNoteTitle,
          }).unwrap();
          api.success({
            message: t("notes.saveSuccess"),
            placement: "topRight",
            duration: 3,
          });
        } else if (noteId === "new") {
          const result = await createNote({
            title: currentNoteTitle || t("notes.untitled"),
            content,
          }).unwrap();
          api.success({
            message: t("notes.createSuccess"),
            placement: "topRight",
            duration: 3,
          });
          navigate(`/notes/${result.id}`, { replace: true });
        }
      } catch (_) {
        api.error({
          message: t("notes.saveFailed"),
          placement: "topRight",
          duration: 4,
        });
      }
    },
    [noteId, currentNoteTitle, updateNote, createNote, navigate, t, api],
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    setCurrentNoteTitle(newTitle);
  }, []);

  const handleTitleBlur = useCallback(async () => {
    if (noteId && noteId !== "new" && note && currentNoteTitle !== note.title) {
      try {
        await updateNote({
          noteId,
          title: currentNoteTitle,
          content: note.content,
        }).unwrap();
      } catch (error) {
        console.error("Title update error:", error);
      }
    }
  }, [noteId, note, currentNoteTitle, updateNote]);

  const handleCreateNewNote = useCallback(() => {
    navigate("/notes/new");
  }, [navigate]);

  // Show list if no noteId
  if (!noteId) {
    return (
      <>
        {contextHolder}
        <div className={styles.notesListLayout}>
          <NotesSidebar
            collapsed={collapsed}
            toggleCollapsed={() => setCollapsed((v) => !v)}
            selectedView={notesView}
            onViewChange={setNotesView}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
          />
          <div className={styles.notesListContent}>
            <NotesList
              view={notesView}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        {contextHolder}
        <NotesLayout
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed((v) => !v)}
          currentNoteId={noteId}
          onCreateNote={handleCreateNewNote}
        >
          <div className={styles.errorWrapper}>
            <h2 className={styles.errorTitle}>{t("notes.errorLoading")}</h2>
            <p className={styles.errorText}>{t("notes.noteDeleted")}</p>
            <Button type="primary" onClick={() => navigate("/notes")}>
              {t("notes.backToNotes")}
            </Button>
          </div>
        </NotesLayout>
      </>
    );
  }

  // Render editor (for both new and existing notes)
  return (
    <>
      {contextHolder}
      <NotesLayout
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed((v) => !v)}
        currentNoteId={noteId}
        onCreateNote={handleCreateNewNote}
      >
        <CollaborativeNoteEditor
          key={noteId}
          noteId={noteId}
          title={currentNoteTitle}
          content={noteId === "new" ? [{ type: "paragraph", content: "" }] : note?.content}
          isLoading={isLoading}
          isUpdating={isUpdating}
          isCreating={isCreating}
          onTitleBlur={handleTitleBlur}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          autoSave={noteId !== "new"}
          autoSaveDelay={2000}
        />
      </NotesLayout>
    </>
  );
};

export default Notes;
