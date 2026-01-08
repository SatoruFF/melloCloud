import type { ChatSchema } from "../../../entities/chat";
import { EventSchema } from "../../../entities/event";
import type { FileListSchema } from "../../../entities/file";
import type { MessageSchema } from "../../../entities/message";
import { NotesState } from "../../../entities/note/types/note";
import { TaskState } from "../../../entities/task/types/taskState";
import { TaskColumnState } from "../../../entities/taskColumn/types/taskColumnState";
import type { UserSchema } from "../../../entities/user";
import { userApi } from "../../../entities/user";
import type { IRestoreScroll } from "../../../features/restoreScroll";
import { WebhookListSchema } from "../../../entities/webhooks";
import { rtkApi } from "../../../shared/api/rtkApi";

export interface StateSchema {
  user: UserSchema;
  files: FileListSchema;
  messages: MessageSchema;
  chat: ChatSchema;
  ui: IRestoreScroll;
  notes: NotesState;
  events: EventSchema;
  webhooks: WebhookListSchema;

  // Use proper slice state types instead of raw data types
  tasks: TaskState; // Changed from tasks: Task[] to task: TaskState
  taskColumns: TaskColumnState; // Changed from taskColumn: TaskColumn to column: TaskColumnState

  // RTK Query API slices (have only one reducer path)
  [rtkApi.reducerPath]: ReturnType<typeof rtkApi.reducer>;
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>;
}

// #[allow(dead_code)] ;)
export type StateSchemaKey = keyof StateSchema;
