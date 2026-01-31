import { type FC, type ReactElement, lazy } from 'react';
import React from 'react';

import {
  ACTIVATION_ROUTE,
  CHATS_ROUTE,
  FILE_ROUTE,
  LOGIN_ROUTE,
  NOTES_ROUTE,
  NOT_FOUND,
  MODULES_ROUTE,
  MODULES_POMODORO,
  PROFILE_ROUTE,
  REGISTRATION_ROUTE,
  PLANNER_ROUTE,
  PLANNER_KANBAN_ROUTE,
  PLANNER_CALENDAR_ROUTE,
  WELCOME_ROUTE,
  NOTES_DETAIL_ROUTE,
  SHARED_PUBLIC_ROUTE,
} from '../../consts/routes';

import type { UserRolesType } from '../../../entities/user/model/types/user';
import { NotFoundPage } from '../../../pages/notFoundPage';
import { UserRoles } from '../../consts/roles';
import { PublicShared } from '../../../pages/publicShared';

const Welcome = lazy(() => import('../../../pages/home/ui/Welcome'));
const Authorization = lazy(() => import('../../../pages/authorization/ui/Authorization'));
const FileSpace = lazy(() => import('../../../pages/files/ui/FileSpace'));
const Profile = lazy(() => import('../../../pages/profile/ui/Profile'));
const Pomodoro = lazy(() => import('../../../pages/pomodoro/ui/PomodoroTimer'));
const Chats = lazy(() => import('../../../pages/chats/ui/Chats'));
const Notes = lazy(() => import('../../../pages/notes/ui/Notes'));
const Modules = lazy(() => import('../../../pages/modules/ui/ModulesPage'));

// Planner
const PlannerLayout = lazy(() => import('../../../pages/planner/ui/Planner'));
const KanbanPage = lazy(() => import('../../../pages/planner/KanbanPage/ui/KanbanPage'));
const CalendarPage = lazy(() => import('../../../pages/planner/CalendarPage/ui/CalendarPage'));

const Activate = lazy(() => import('../../../pages/activate/ui/Activate'));

export interface IRoute {
  path: string;
  element: ReactElement;
  private?: boolean;
  roles?: UserRolesType[];
  children?: IRoute[]; // добавляем поддержку вложенных роутов
}

const createRoutes = (
  routes: {
    path: string;
    element: FC;
    private?: boolean;
    roles?: UserRolesType[];
    children?: {
      path: string;
      element: FC;
      private?: boolean;
      roles?: UserRolesType[];
    }[];
  }[],
): IRoute[] =>
  routes.map(route => ({
    ...route,
    element: React.createElement(route.element),
    children: route.children?.map(child => ({
      ...child,
      element: React.createElement(child.element),
    })),
  }));

// Публичные роуты
const publicRoutes: IRoute[] = createRoutes([
  { path: WELCOME_ROUTE, element: Welcome },
  { path: LOGIN_ROUTE, element: Authorization },
  { path: REGISTRATION_ROUTE, element: Authorization },
  { path: ACTIVATION_ROUTE, element: Activate },
  { path: SHARED_PUBLIC_ROUTE, element: PublicShared },
  { path: NOT_FOUND, element: NotFoundPage },
]);

// Приватные роуты
const privateRoutes: IRoute[] = createRoutes([
  { path: FILE_ROUTE, element: FileSpace, private: true },
  { path: PROFILE_ROUTE, element: Profile, private: true },
  { path: CHATS_ROUTE, element: Chats, private: true },
  { path: NOTES_ROUTE, element: Notes, private: true },
  { path: NOTES_DETAIL_ROUTE, element: Notes, private: true },

  // Planner с вложенными роутами
  {
    path: PLANNER_ROUTE,
    element: PlannerLayout,
    private: true,
    children: [
      { path: 'kanban', element: KanbanPage, private: true },
      { path: 'calendar', element: CalendarPage, private: true },
    ],
  },

  {
    path: MODULES_ROUTE,
    element: Modules,
    private: true,
    children: [{ path: 'pomodoro', element: Pomodoro, private: true }],
  },
]); // {
// 	path: ADMIN_PANEL,
// 	element: AdminPanel,
// 	private: true,
// 	roles: [UserRoles.ADMIN],
// },

export const routes: IRoute[] = [...publicRoutes, ...privateRoutes];
