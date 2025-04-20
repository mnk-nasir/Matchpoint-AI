import api from "./api";

export const adminStartupsService = {
  async update(id: string, payload: any) {
    const res = await api.patch(`/admin/startups/${id}/`, payload);
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`/admin/startups/${id}/`);
    return res.data;
  },
};
