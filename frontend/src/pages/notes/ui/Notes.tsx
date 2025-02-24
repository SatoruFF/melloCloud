import cn from 'classnames';
import styles from './notes.module.scss';
import React from 'react';
import NotesSidebar from '../../../widgets/notesSidebar/ui/NotesSidebar';

const Notes = () => {
  return (
    <div className={cn(styles.notesWrapper)}>
      <NotesSidebar></NotesSidebar>
    </div>
  );
};

export default Notes;
