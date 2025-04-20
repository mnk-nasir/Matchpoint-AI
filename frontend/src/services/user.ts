import api from "./api";

export interface CurrentUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_investor?: boolean;
  is_founder?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
}

export const userService = {
  async me(): Promise<CurrentUser> {
    const res = await api.get("/auth/me/");
    return res.data as CurrentUser;
  },
  async updateProfile(data: { first_name?: string; last_name?: string }): Promise<CurrentUser> {
    const res = await api.put("/auth/me/", data);
    return res.data as CurrentUser;
  }
};

