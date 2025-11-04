import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthInit() {
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");

      // ✅ Case 1: User comes from Google OAuth redirect
      if (urlToken) {
        console.log("OAuth token detected:", urlToken);
        localStorage.setItem("token", urlToken);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect user to dashboard after login
        navigate("/app", { replace: true });
        return;
      }

      // ✅ Case 2: No token found (normal flow) — do nothing
    };

    initAuth();
  }, [navigate]);
}
