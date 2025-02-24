import { FC, lazy, ReactElement } from 'react';
import React from 'react';

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
  NOT_FOUND,
} from '../../consts/routes';

import { NotFoundPage } from '../../../pages/notFoundPage';

const Welcome = lazy(() => import('../../../pages/home/ui/Welcome'));
const Authorization = lazy(() => import('../../../pages/authorization/ui/Authorization'));
const FileSpace = lazy(() => import('../../../pages/files/ui/FileSpace'));
const Profile = lazy(() => import('../../../pages/profile/ui/Profile'));
const Pomodoro = lazy(() => import('../../../pages/pomodoro/ui/PomodoroTimer'));
const Chats = lazy(() => import('../../../pages/chats/ui/Chats'));
const Notes = lazy(() => import('../../../pages/notes/ui/Notes'));
const Todo = lazy(() => import('../../../pages/todo/ui/Todo'));
const Activate = lazy(() => import('../../../pages/activate/ui/Activate'));

export interface IRoute {
  path: string;
  element: ReactElement;
  private?: boolean;
}

// Функция для создания маршрутов с JSX-элементами
const createRoutes = (routes: { path: string; element: FC; private?: boolean }[]): IRoute[] =>
  routes.map(route => ({ ...route, element: React.createElement(route.element) }));

// Публичные роуты
const publicRoutes: IRoute[] = createRoutes([
  { path: WELCOME_ROUTE, element: Welcome },
  { path: LOGIN_ROUTE, element: Authorization },
  { path: REGISTRATION_ROUTE, element: Authorization },
  { path: ACTIVATION_ROUTE, element: Activate },
  { path: NOT_FOUND, element: NotFoundPage },
]);

// Приватные роуты (сразу добавляем private: true)
const privateRoutes: IRoute[] = createRoutes([
  { path: FILE_ROUTE, element: FileSpace, private: true },
  { path: PROFILE_ROUTE, element: Profile, private: true },
  { path: CHATS_ROUTE, element: Chats, private: true },
  { path: NOTES_ROUTE, element: Notes, private: true },
  { path: TODO_ROUTE, element: Todo, private: true },
  { path: POMODORO_ROUTE, element: Pomodoro, private: true },
]);

// Объединяем все роуты
export const routes: IRoute[] = [...publicRoutes, ...privateRoutes];
