import { createClient } from './Client';

export const WWClient = createClient({
  serverUrl: import.meta.env.VITE_API_URL,
  appId: "",
  requiresAuth: false
});