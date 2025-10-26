import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { ROUTES, PAGES } from "./lib/routeConstants";

export default [
  index(PAGES.home),
  route(ROUTES.datasets.create, PAGES.datasets.create),
  route(ROUTES.datasets.search, PAGES.datasets.search),
  route(ROUTES.datasets.detail, PAGES.datasets.detail),
  route(ROUTES.auth.login, PAGES.auth.login),
  route(ROUTES.auth.register, PAGES.auth.register),
  route(ROUTES.requests.search.admin, PAGES.requests.search.admin),
  route(ROUTES.requests.detail, PAGES.requests.detail),
  route(ROUTES.requests.search.user, PAGES.requests.search.user),
] satisfies RouteConfig;
