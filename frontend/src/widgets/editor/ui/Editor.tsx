import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

import styles from "./editor.module.scss";
import "./editor.scss";

export default function App() {
  const editor = useCreateBlockNote();

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.blocknoteContainer}>
        <BlockNoteView className={styles.editor} editor={editor} />
      </div>
    </div>
  );
}
