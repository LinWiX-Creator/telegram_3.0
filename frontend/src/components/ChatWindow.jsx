import { useState } from 'react';

export default function ChatWindow({ me, activeDialog, messages, onSend }) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim() || !activeDialog) return;
    await onSend(activeDialog, text);
    setText('');
  };

  if (!activeDialog) {
    return (
      <section className="chat-window empty">
        <h2>Выберите диалог или найдите пользователя по ID</h2>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header>
        <h2>Чат с {activeDialog}</h2>
      </header>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.from_user_id === me.user_id ? 'mine' : 'other'}`}>
            <p>{msg.text}</p>
            <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      <div className="composer">
        <input
          placeholder="Введите сообщение"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </section>
  );
}
