import { useDebounce } from './lib/hooks/useDebounce';
import { useInfiniteScroll } from './lib/hooks/useInfiniteScroll';
import NavLink from './ui/NavLink/NavLink';
import ObservablePage from './ui/ObservablePage/ObservablePage';
import Search from './ui/Search/Search';
import AppSkeleton from './ui/Skeleton/AppSkeleton';
import Spinner from './ui/Spinner/Spinner';
import ParticleEffect from './ui/particleEffect/ParticleEffect';
import { type IRoute, routes } from './config/routeConfig/routes';
import { WELCOME_ROUTE, NOT_FOUND } from './consts/routes';
import { rtkApi } from './api/rtkApi';

export {
  NavLink,
  ParticleEffect,
  Spinner,
  Search,
  ObservablePage,
  useInfiniteScroll,
  useDebounce,
  AppSkeleton,
  type IRoute,
  routes,
  NOT_FOUND,
  WELCOME_ROUTE,
  rtkApi,
};
