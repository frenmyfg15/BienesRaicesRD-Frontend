import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://helpful-sparkle-bienesraicesrd.up.railway.app',
  withCredentials: true,
});

export default api;
