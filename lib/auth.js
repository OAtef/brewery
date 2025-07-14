import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser, clearUser } from "./redux/userSlice";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user data exists in local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      dispatch(setReduxUser(parsedUser));
    }
    setLoading(false);
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        dispatch(setReduxUser(data.user));
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return { error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An unexpected error occurred." };
    }
  };

  const logout = () => {
    setUser(null);
    dispatch(clearUser());
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
