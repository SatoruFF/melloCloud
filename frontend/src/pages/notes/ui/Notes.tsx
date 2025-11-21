import React, { useState } from "react";
import { Editor } from "../../../widgets/editor";
import NotesSidebar from "../../../widgets/notesSidebar/ui/NotesSidebar";
import styles from "./notes.module.scss";
import cn from "classnames";

const Notes = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(styles.notesWrapper)}>
      <NotesSidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed((v) => !v)} />

      <div className={styles.editor}>
        <Editor />
      </div>
    </div>
  );
};

export default Notes;
