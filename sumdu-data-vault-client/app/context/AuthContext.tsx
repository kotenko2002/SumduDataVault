import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "~/lib/routeConstants";

interface AuthContextType {
  isAuthorized: boolean;
  setIsAuthorized: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  updateAuthFromToken: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkToken = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const parsedToken = JSON.parse(atob(token.split(".")[1]));
        const role = parsedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        setIsAuthorized(true);
        setUserRole(role || null);
        console.log('role', role);
      } catch (error) {
        console.error("Error parsing token:", error);
        setIsAuthorized(false);
        setUserRole(null);
      }
    } else {
      setIsAuthorized(false);
      setUserRole(null);
    }
  };

  const updateAuthFromToken = checkToken;

  const logout = () => {
    try {
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Error removing access token:", error);
    }
    setIsAuthorized(false);
    setUserRole(null);
  };

  useEffect(() => {
    checkToken();

    const handleTokenRemoved = () => {
        setIsAuthorized(false);
        setUserRole(null);
        navigate(`/${ROUTES.auth.login}`, { replace: true });
    };

    window.addEventListener("tokenRemoved", handleTokenRemoved);
    
    return () => {
      window.removeEventListener("tokenRemoved", handleTokenRemoved);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthorized, setIsAuthorized, userRole, setUserRole, updateAuthFromToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
