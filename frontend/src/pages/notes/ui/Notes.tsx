import cn from 'classnames';
import styles from './notes.module.scss';
import React from 'react';
import NotesSidebar from '../../../widgets/notesSidebar/ui/NotesSidebar';
import { Editor } from '../../../widgets/editor';

const Notes = () => {
  return (
    <div className={cn(styles.notesWrapper)}>
      <NotesSidebar />
      <Editor />
    </div>
  );
};

export default Notes;
