import api, { fetchCsrfToken } from "./axiosClient";

export async function uploadEventImage(file) {
  if (!file) throw new Error("No file provided");

  const csrf = await fetchCsrfToken();
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/api/event/upload-image", formData, {
    headers: {
      "X-CSRF-Token": csrf,
    },
  });

  return res.data;
}
