import { useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get("authToken"));

  const login = (token) => {
      Cookies.set("authToken", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("authToken");
    setIsAuthenticated(false);
  };

  const authValue = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
