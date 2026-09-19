import axios from "axios";

const api = axios.create({
  baseURL: "https://watersupplymanagement-2yw9.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },
});


// Add JWT automatically
api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


export default api;
