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
} from '../../../utils/consts';

const Welcome = lazy(() => import('../../../components/pages/Welcome'));
const Authorization = lazy(() => import('../../../components/pages/Authorization'));
const FileSpace = lazy(() => import('../../../components/pages/FileSpace'));
const Profile = lazy(() => import('../../../components/pages/Profile'));
const Pomodoro = lazy(() => import('../../../components/pages/PomodoroTimer'));
const Chats = lazy(() => import('../../../components/pages/Chats'));
const Notes = lazy(() => import('../../../components/pages/Notes'));
const Todo = lazy(() => import('../../../components/pages/Todo'));
const Activate = lazy(() => import('../../../components/pages/Activate'));

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
