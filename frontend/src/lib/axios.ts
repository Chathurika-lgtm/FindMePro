
import axios from "axios";
import { getToken } from "./token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData requests වල Content-Type එක Axios/browser එකට
    // නිවැරදිව සකස් කිරීමට ඉඩ දෙන්න.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    } else if (config.data !== undefined && config.data !== null) {
      config.headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
