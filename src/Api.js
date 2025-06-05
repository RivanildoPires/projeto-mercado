import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const login = async (credentials) => {
  return api.post("/login", credentials);
};