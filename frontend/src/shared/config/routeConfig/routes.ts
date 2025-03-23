import { FC, ReactElement, lazy } from 'react';
import React from 'react';

import {
  ACTIVATION_ROUTE,
  ADMIN_PANEL,
  CHATS_ROUTE,
  FILE_ROUTE,
  LOGIN_ROUTE,
  NOTES_ROUTE,
  NOT_FOUND,
  POMODORO_ROUTE,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
  TODO_ROUTE,
  WELCOME_ROUTE,
} from '../../consts/routes';

import { UserRolesType } from '../../../entities/user/model/types/user';
import { NotFoundPage } from '../../../pages/notFoundPage';
import { UserRoles } from '../../consts/roles';

const Welcome = lazy(() => import('../../../pages/home/ui/Welcome'));
const Authorization = lazy(() => import('../../../pages/authorization/ui/Authorization'));
const FileSpace = lazy(() => import('../../../pages/files/ui/FileSpace'));
const Profile = lazy(() => import('../../../pages/profile/ui/Profile'));
const Pomodoro = lazy(() => import('../../../pages/pomodoro/ui/PomodoroTimer'));
const Chats = lazy(() => import('../../../pages/chats/ui/Chats'));
const Notes = lazy(() => import('../../../pages/notes/ui/Notes'));
const Todo = lazy(() => import('../../../pages/todo/ui/Todo'));
const Activate = lazy(() => import('../../../pages/activate/ui/Activate'));
const AdminPanel = lazy(() => import('../../../pages/adminPanel/index'));

export interface IRoute {
  path: string;
  element: ReactElement;
  private?: boolean;
  roles?: UserRolesType[];
}

// Функция для создания маршрутов с JSX-элементами
const createRoutes = (routes: { path: string; element: FC; private?: boolean; roles?: UserRolesType[] }[]): IRoute[] =>
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
  { path: ADMIN_PANEL, element: AdminPanel, private: true, roles: [UserRoles.ADMIN] },
]);

// Объединяем все роуты
export const routes: IRoute[] = [...publicRoutes, ...privateRoutes];
