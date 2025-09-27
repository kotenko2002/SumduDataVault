import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("form", "routes/form.tsx"),
  route("create-dataset", "routes/createDatasetForm.tsx"),
  route("search", "routes/search.tsx"),
  route("dataset/:id", "routes/dataset.$id.tsx")
] satisfies RouteConfig;
