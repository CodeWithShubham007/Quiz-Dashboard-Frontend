import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL
  || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

export default api;
