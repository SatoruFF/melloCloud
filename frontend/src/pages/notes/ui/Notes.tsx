import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NotesLayout } from "../../../widgets/notesLayout";
import { NoteEditor } from "../../../widgets/noteEditor";
import { NotesList } from "../../../widgets/notesList";
import {
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
} from "../../../entities/note/model/api/noteApi";
import { message } from "antd";
import { useTranslation } from "react-i18next";

const Notes = () => {
  const { t } = useTranslation();
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [currentNoteTitle, setCurrentNoteTitle] = useState("");

  const { note, isLoading, error } = useGetNoteQuery(noteId!, {
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
          message.success(t("notes.saveSuccess"));
        } else if (noteId === "new") {
          const result = await createNote({
            title: currentNoteTitle || t("notes.untitled"),
            content,
          }).unwrap();
          message.success(t("notes.createSuccess"));
          navigate(`/notes/${result.id}`, { replace: true });
        }
      } catch (_) {
        message.error(t("notes.saveFailed"));
      }
    },
    [noteId, currentNoteTitle, updateNote, createNote, navigate, t]
  );

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setCurrentNoteTitle(newTitle);

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

  const handleCreateNewNote = useCallback(() => {
    navigate("/notes/new");
  }, [navigate]);

  // Show list if no noteId
  if (!noteId) {
    return <NotesList />;
  }

  // Error state
  if (error) {
    return (
      <NotesLayout
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed((v) => !v)}
        currentNoteId={noteId}
        onCreateNote={handleCreateNewNote}
      >
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>{t("notes.errorLoading")}</h2>
          <p>{t("notes.noteDeleted")}</p>
          <button onClick={() => navigate("/notes")}>{t("notes.backToNotes")}</button>
        </div>
      </NotesLayout>
    );
  }

  // Render editor (for both new and existing notes)
  return (
    <NotesLayout
      collapsed={collapsed}
      toggleCollapsed={() => setCollapsed((v) => !v)}
      currentNoteId={noteId}
      onCreateNote={handleCreateNewNote}
    >
      <NoteEditor
        noteId={noteId}
        title={currentNoteTitle}
        content={noteId === "new" ? [{ type: "paragraph", content: "" }] : note?.content}
        isLoading={isLoading}
        isUpdating={isUpdating}
        isCreating={isCreating}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        autoSave={noteId !== "new"}
        autoSaveDelay={2000}
      />
    </NotesLayout>
  );
};

export default Notes;
