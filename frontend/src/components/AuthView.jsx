import { useState } from 'react';

export default function AuthView({ onAuth, loading }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const submit = (event) => {
    event.preventDefault();
    onAuth(mode, form);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Telegram MVP</h1>
        <p>Быстрая регистрация и вход по email.</p>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <input
              placeholder="Имя"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          )}
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            placeholder="Пароль"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />

          <button disabled={loading} type="submit">
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}
