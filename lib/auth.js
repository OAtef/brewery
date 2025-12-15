import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser, clearUser } from "./redux/userSlice";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  // Function to validate if user still exists in the database
  const validateUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("User validation error:", error);
      return false;
    }
  };

  // Enhanced logout function that can be called programmatically
  const logout = (reason = null) => {
    setUser(null);
    dispatch(clearUser());
    localStorage.removeItem("user");

    // If logout was due to invalid session, show a message
    if (reason === "invalid_session") {
      // We'll use a timeout to allow the notification provider to be ready
      setTimeout(() => {
        // This will be handled by components that can show notifications
        router.push("/?sessionExpired=true");
      }, 100);
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user data exists in local storage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Validate if the user still exists in the database
          const isValid = await validateUser(parsedUser.id);

          if (isValid) {
            setUser(parsedUser);
            dispatch(setReduxUser(parsedUser));
          } else {
            // User doesn't exist in database, logout
            console.warn("User in localStorage is invalid, logging out");
            logout("invalid_session");
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);

      // Redirect to login page if not authenticated and trying to access a protected route
      if (
        !user &&
        router.pathname !== "/" &&
        !router.pathname.startsWith("/api") &&
        !router.pathname.startsWith("/menu") &&
        router.pathname !== "/landing"
      ) {
        router.push("/");
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        dispatch(setReduxUser(data.user));
        return { success: true };
      } else {
        return { error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An unexpected error occurred." };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, validateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
