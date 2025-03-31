import cn from "classnames";
import React from "react";
import { Editor } from "../../../widgets/editor";
import NotesSidebar from "../../../widgets/notesSidebar/ui/NotesSidebar";
import styles from "./notes.module.scss";

const Notes = () => {
	return (
		<div className={cn(styles.notesWrapper)}>
			<NotesSidebar />
			<Editor />
		</div>
	);
};

export default Notes;
