import { Link, useLocation, useNavigate } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";
import { useAuth } from "~/context/AuthContext";
import { ROUTES } from "~/lib/routeConstants";

type NavigationItem = {
  title: string;
  href?: string;
  type: 'link' | 'dropdown';
  items?: Array<{
    title: string;
    href: string;
  }>;
};

const getNavigationItemsAuthorized = (userRole: string | null): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    { 
      title: "Головна", 
      href: `/${ROUTES.home}`, 
      type: 'link'
    },
    {
      title: "Датасети",
      type: 'dropdown',
      items: [
        { title: "Пошук", href: `/${ROUTES.datasets.search}` },
        { title: "Створити", href: `/${ROUTES.datasets.create}` },
      ]
    },
  ];

  // Додаємо пункт залежно від ролі користувача
  if (userRole === "Admin") {
    baseItems.push({
      title: "Розгляд запитів",
      href: `/${ROUTES.requests.search.admin}`,
      type: 'link'
    });
  } else {
    baseItems.push({
      title: "Історія запитів користувача",
      href: `/${ROUTES.requests.search.user}`,
      type: 'link'
    });
  }

  return baseItems;
};

const navigationItemsUnauthorized: NavigationItem[] = [
  { 
    title: "Головна", 
    href: `/${ROUTES.home}`, 
    type: 'link'
  },
  { 
    title: "Вхід", 
    href: `/${ROUTES.auth.login}`, 
    type: 'link'
  },
  { 
    title: "Реєстрація", 
    href: `/${ROUTES.auth.register}`, 
    type: 'link'
  },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthorized, logout, userRole } = useAuth();
  const navigationItems = isAuthorized ? getNavigationItemsAuthorized(userRole) : navigationItemsUnauthorized;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link to={`/${ROUTES.home}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="SumduDataVault Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold">Sumdu Data Vault</span>
          </Link>

          {/* Навігаційне меню */}
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {navigationItems.map((item, index) => (
                <NavigationMenuItem key={item.href || item.title}>
                  {item.type === 'link' ? (
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href!}
                        className={cn(
                          "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                          location.pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  ) : (
                    <>
                      <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-4">
                          <li>
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink key={subItem.href} asChild>
                                <Link
                                  to={subItem.href}
                                  className={cn(
                                    "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    location.pathname === subItem.href && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  {subItem.title}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
              {isAuthorized && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to={`/${ROUTES.auth.login}`}
                      onClick={logout}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                      )}
                    >
                      Вийти
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
