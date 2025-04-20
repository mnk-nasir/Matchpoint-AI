import api from "./api";
import { setAccessToken, setRefreshToken, clearAccessToken, clearRefreshToken } from "../utils/auth";

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post("/auth/login/", { email, password });
    const access = (res.data as any)?.access;
    const refresh = (res.data as any)?.refresh;
    if (access) setAccessToken(access);
    if (refresh) setRefreshToken(refresh);
    return res.data;
  },
  logout() {
    clearAccessToken();
    clearRefreshToken();
  },
  async forgotPassword(email: string) {
    const res = await api.post("/auth/forgot-password/", { email });
    return res.data;
  },
  async resetPassword(uid: string, token: string, password: string) {
    const res = await api.post("/auth/reset-password/", { uid, token, password });
    return res.data;
  },
};

