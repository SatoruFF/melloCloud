import { FC, lazy } from 'react';

import {
  WELCOME_ROUTE,
  REGISTRATION_ROUTE,
  LOGIN_ROUTE,
  FILE_ROUTE,
  PROFILE_ROUTE,
  POMODORO_ROUTE,
  CHATS_ROUTE,
  NOTES_ROUTE,
  TODO_ROUTE,
  ACTIVATION_ROUTE,
} from '../../consts/consts';

const Welcome = lazy(() => import('../../../pages/home/ui/Welcome'));
const Authorization = lazy(() => import('../../../pages/authorization/ui/Authorization'));
const FileSpace = lazy(() => import('../../../pages/files/ui/FileSpace'));
const Profile = lazy(() => import('../../../pages/profile/ui/Profile'));
const Pomodoro = lazy(() => import('../../../pages/pomodoro/ui/PomodoroTimer'));
const Chats = lazy(() => import('../../../pages/chats/ui/Chats'));
const Notes = lazy(() => import('../../../pages/notes/ui/Notes'));
const Todo = lazy(() => import('../../../pages/todo/ui/Todo'));
const Activate = lazy(() => import('../../../pages/activate/ui/Activate'));

interface Route {
  path: string;
  element: FC;
}

export const routes: Route[] = [
  {
    path: WELCOME_ROUTE,
    element: Welcome,
  },
  {
    path: LOGIN_ROUTE,
    element: Authorization,
  },
  {
    path: REGISTRATION_ROUTE,
    element: Authorization,
  },
  {
    path: ACTIVATION_ROUTE,
    element: Activate,
  },
];

export const privateRoutes: Route[] = [
  {
    path: WELCOME_ROUTE,
    element: Welcome,
  },
  {
    path: FILE_ROUTE,
    element: FileSpace,
  },
  {
    path: PROFILE_ROUTE,
    element: Profile,
  },
  {
    path: CHATS_ROUTE,
    element: Chats,
  },
  {
    path: NOTES_ROUTE,
    element: Notes,
  },
  {
    path: TODO_ROUTE,
    element: Todo,
  },
  {
    path: POMODORO_ROUTE,
    element: Pomodoro,
  },
];
