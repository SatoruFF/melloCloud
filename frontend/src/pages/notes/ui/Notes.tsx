import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "../../../widgets/editor";
import NotesSidebar from "../../../widgets/notesSidebar/ui/NotesSidebar";
import { NotesList } from "../../../widgets/notesList";
import {
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
} from "../../../entities/note/model/api/noteApi";
import { message, Spin } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./notes.module.scss";
import cn from "classnames";

const Notes = () => {
  const { t } = useTranslation();
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [currentNoteTitle, setCurrentNoteTitle] = useState("");

  // Queries and mutations
  const {
    data: note,
    isLoading,
    error,
  } = useGetNoteQuery(noteId!, {
    skip: !noteId || noteId === "new",
  });

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();

  // Update title when note loads
  useEffect(() => {
    if (note) {
      setCurrentNoteTitle(note.title);
    }
  }, [note]);

  const handleSave = useCallback(
    async (content: any) => {
      try {
        if (noteId && noteId !== "new") {
          // Update existing note
          await updateNote({
            noteId,
            content,
            title: currentNoteTitle,
          }).unwrap();
          message.success(t("notes.saveSuccess"));
        } else {
          // Create new note
          const result = await createNote({
            title: currentNoteTitle || t("notes.untitled"),
            content,
          }).unwrap();
          message.success(t("notes.createSuccess"));
          navigate(`/notes/${result.id}`);
        }
      } catch (error: any) {
        message.error(t("notes.saveFailed"));
        console.error("Save error:", error);
      }
    },
    [noteId, currentNoteTitle, updateNote, createNote, navigate, t]
  );

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setCurrentNoteTitle(newTitle);

      // Auto-save title if editing existing note
      if (noteId && noteId !== "new" && note) {
        try {
          await updateNote({
            noteId,
            title: newTitle,
            content: note.content,
          }).unwrap();
        } catch (error) {
          console.error("Title update error:", error);
        }
      }
    },
    [noteId, note, updateNote]
  );

  const handleCreateNewNote = useCallback(async () => {
    try {
      const result = await createNote({
        title: t("notes.untitled"),
        content: [
          {
            type: "paragraph",
            content: "",
          },
        ],
      }).unwrap();
      navigate(`/notes/${result.id}`);
    } catch (error) {
      message.error(t("notes.createFailed"));
      console.error("Create error:", error);
    }
  }, [createNote, navigate, t]);

  // If no noteId in URL, show list
  if (!noteId) {
    return (
      <div className={cn(styles.notesWrapper)}>
        <div className={styles.notesContent}>
          <NotesList />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={cn(styles.notesWrapper)}>
        <NotesSidebar
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed((v) => !v)}
          currentNoteId={noteId}
          onCreateNote={handleCreateNewNote}
        />
        <div className={styles.editor}>
          <div className={cn(styles.errorState)}>
            <h2>Error loading note</h2>
            <p>The note could not be loaded. It may have been deleted.</p>
            <button onClick={() => navigate("/notes")}>Back to Notes</button>
          </div>
        </div>
      </div>
    );
  }

  // If noteId exists, show editor
  return (
    <div className={cn(styles.notesWrapper)}>
      <NotesSidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed((v) => !v)}
        currentNoteId={noteId}
        onCreateNote={handleCreateNewNote}
      />
      <div className={styles.editor}>
        {isLoading ? (
          <div className={cn(styles.loading)}>
            <Spin size="large" />
            <p>{t("notes.loading")}</p>
          </div>
        ) : (
          <div className={cn(styles.editorContent)}>
            {/* Title Editor */}
            <div className={cn(styles.titleContainer)}>
              <input
                type="text"
                className={cn(styles.titleInput)}
                value={currentNoteTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t("notes.untitled")}
                disabled={isUpdating}
              />
            </div>

            {/* Content Editor */}
            <Editor initialContent={note?.content} onSave={handleSave} autoSave={true} autoSaveDelay={2000} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
