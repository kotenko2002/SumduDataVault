// Структуровані константи для маршрутів
export const ROUTES = {
  home: "",
  datasets: {
    create: "datasets/create",
    search: "datasets/search",
    detail: "datasets/detail/:id"
  },
  auth: {
    login: "auth/login",
    register: "auth/register"
  },
  requests: {
    search: {
      admin: "requests/search/admin",
      user: "requests/search/user"
    },
    detail: "requests/detail/:id"
  }
} as const;

export const PAGES = {
  home: "routes/home.tsx",
  datasets: {
    create: "routes/datasets/create.tsx",
    search: "routes/datasets/search.tsx",
    detail: "routes/datasets/detail.$id.tsx"
  },
  auth: {
    login: "routes/auth/login.tsx",
    register: "routes/auth/register.tsx"
  },
  requests: {
    search: {
      admin: "routes/requests/searchAdmin.tsx",
      user: "routes/requests/searchUser.tsx"
    },
    detail: "routes/requests/detail.$id.tsx"
  }
} as const;
