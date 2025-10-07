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

const navigationItemsAuthorized = [
  { title: "Головна", href: "/", description: "Повернутися на головну сторінку" },
  { title: "Пошук", href: "/search", description: "Пошук та фільтрація датасетів" },
  { title: "Створити датасет", href: "/create-dataset", description: "Створення нового датасету з CSV файлом" },
];

const navigationItemsUnauthorized = [
  { title: "Головна", href: "/", description: "Повернутися на головну сторінку" },
  { title: "Вхід", href: "/login", description: "Увійти до системи" },
  { title: "Реєстрація", href: "/register", description: "Створити обліковий запис" },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthorized, setIsAuthorized } = useAuth();
  const navigationItems = isAuthorized ? navigationItemsAuthorized : navigationItemsUnauthorized;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="SumduDataVault Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold">Sumdu Data Vault</span>
          </Link>

          {/* Навігаційне меню */}
          <NavigationMenu>
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        location.pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              {isAuthorized && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/login"
                      onClick={() => {
                        try { localStorage.removeItem("accessToken"); } catch {}
                        setIsAuthorized(false);
                      }}
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
