import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

async function request(path, method = 'GET', token, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', 'POST', null, payload),
  login: (payload) => request('/auth/login', 'POST', null, payload),
  me: (token) => request('/users/me', 'GET', token),
  findUserById: (token, userId) => request(`/users/by-id/${userId}`, 'GET', token),
  getDialogs: (token) => request('/dialogs', 'GET', token),
  getMessages: (token, partnerId) => request(`/messages/${partnerId}`, 'GET', token),
  sendMessage: (token, payload) => request('/messages', 'POST', token, payload),
  createSocket: (token) => io(API_URL, { auth: { token } })
};
