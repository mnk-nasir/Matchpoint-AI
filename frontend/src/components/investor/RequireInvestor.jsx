import React, { useEffect, useState } from "react";
import { userService } from "../../services/user";
import { getAccessToken } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

export default function RequireInvestor({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate("/investors/login");
      return;
    }
    userService
      .me()
      .then((u) => {
        if (u.is_investor) {
          setAllowed(true);
        } else {
          navigate("/investors/login");
        }
      })
      .catch(() => navigate("/investors/login"))
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return <div className="min-h-screen text-white flex items-center justify-center">Checking access…</div>;
  }
  if (!allowed) return null;
  return <>{children}</>;
}

