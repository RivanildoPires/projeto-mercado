import axios from 'axios';

const API_URL = 'http://localhost:8080/produto';

export const login = async (credentials) => {
  return api.post("/login", credentials);
};

export const getProducts = async () => {
  return axios.get(API_URL);
};

export const createProduct = async (productData) => {
  return axios.post(API_URL, productData);
};

export const updateProduct = async (id, productData) => {
  return axios.put(`${API_URL}/${id}`, productData);
};

export const deleteProduct = async (id) => {
  return axios.delete(`${API_URL}/${id}`);
};
