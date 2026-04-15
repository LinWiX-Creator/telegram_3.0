import { useEffect, useMemo, useState } from 'react';
import AuthView from './components/AuthView.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import { api } from './api.js';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [me, setMe] = useState(null);
  const [dialogs, setDialogs] = useState([]);
  const [activeDialog, setActiveDialog] = useState('');
  const [messages, setMessages] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const socket = useMemo(() => (token ? api.createSocket(token) : null), [token]);

  useEffect(() => {
    if (!token) return;

    async function bootstrap() {
      try {
        const myProfile = await api.me(token);
        setMe(myProfile);
        const myDialogs = await api.getDialogs(token);
        setDialogs(myDialogs);
      } catch (error) {
        alert(error.message);
        localStorage.removeItem('token');
        setToken(null);
      }
    }

    bootstrap();
  }, [token]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message) => {
      setDialogs((prev) => {
        const partnerId = message.from_user_id === me?.user_id ? message.to_user_id : message.from_user_id;
        const cleaned = prev.filter((item) => item.partnerId !== partnerId);
        return [{ partnerId, lastMessage: message.text, createdAt: message.created_at }, ...cleaned];
      });

      if (
        activeDialog &&
        (message.from_user_id === activeDialog || message.to_user_id === activeDialog)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, activeDialog, me]);

  async function handleAuth(mode, form) {
    setLoading(true);
    try {
      const response = mode === 'login' ? await api.login(form) : await api.register(form);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setMe(response.user);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchId.trim()) return;
    try {
      const found = await api.findUserById(token, searchId.trim());
      setFoundUser(found);
    } catch (error) {
      setFoundUser(null);
      alert(error.message);
    }
  }

  async function selectDialog(partnerId) {
    setActiveDialog(partnerId);
    const history = await api.getMessages(token, partnerId);
    setMessages(history);
  }

  async function send(partnerId, text) {
    await api.sendMessage(token, { toUserId: partnerId, text });
  }

  if (!token || !me) {
    return <AuthView onAuth={handleAuth} loading={loading} />;
  }

  return (
    <main className="layout">
      <Sidebar
        me={me}
        dialogs={dialogs}
        searchId={searchId}
        setSearchId={setSearchId}
        onSearch={handleSearch}
        foundUser={foundUser}
        onSelectDialog={selectDialog}
      />
      <ChatWindow me={me} activeDialog={activeDialog} messages={messages} onSend={send} />
    </main>
  );
}
