// hooks
import { useDebounce } from './lib/hooks/useDebounce';
import { useInfiniteScroll } from './lib/hooks/useInfiniteScroll';

// ui
import AppSkeleton from './ui/Skeleton/AppSkeleton';
import NavLink from './ui/NavLink/NavLink';
import ObservablePage from './ui/ObservablePage/ObservablePage';
import ParticleEffect from './ui/particleEffect/ParticleEffect';
import Search from './ui/Search/Search';
import Spinner from './ui/Spinner/Spinner';

// config & routing
import { Variables } from './consts/localVariables';
import { type IRoute, routes } from './config/routeConfig/routes';
import { NOT_FOUND, WELCOME_ROUTE } from './consts/routes';

// api & utils
import { rtkApi } from './api/rtkApi';
import { ApiPaths } from './consts/localVariables';
import { generateParams } from './lib/url/generateParams/generateParams';
import { addQueryParams } from './lib/url/addQueryParams/addQueryParams';
import { queryParamsSync } from './consts/queryParamsSync';
import { sizeFormat } from './utils/sizeFormat';

export {
  // hooks
  useDebounce,
  useInfiniteScroll,
  // ui
  AppSkeleton,
  NavLink,
  ObservablePage,
  ParticleEffect,
  Search,
  Spinner,
  // config & routing
  Variables,
  type IRoute,
  routes,
  NOT_FOUND,
  WELCOME_ROUTE,
  // api & utils
  rtkApi,
  generateParams,
  addQueryParams,
  queryParamsSync,
  ApiPaths,
  sizeFormat,
};
