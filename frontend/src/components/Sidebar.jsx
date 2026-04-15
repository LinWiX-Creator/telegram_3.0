export default function Sidebar({ me, dialogs, searchId, setSearchId, onSearch, foundUser, onSelectDialog }) {
  async function copyId() {
    await navigator.clipboard.writeText(me.user_id);
    alert('Ваш ID скопирован');
  }

  return (
    <aside className="sidebar">
      <div className="profile">
        <h3>{me.username}</h3>
        <p>{me.email}</p>
        <div className="my-id">
          <span>{me.user_id}</span>
          <button onClick={copyId}>Копировать ID</button>
        </div>
      </div>

      <div className="search-panel">
        <label>Найти пользователя по ID</label>
        <input
          placeholder="user_xxxxxx"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
        />
        <button onClick={onSearch}>Найти</button>
        {foundUser && (
          <button className="secondary" onClick={() => onSelectDialog(foundUser.user_id)}>
            Написать {foundUser.username}
          </button>
        )}
      </div>

      <div className="dialog-list">
        <h4>Диалоги</h4>
        {dialogs.length === 0 && <p className="hint">Пока нет диалогов.</p>}
        {dialogs.map((item) => (
          <button key={item.partnerId} className="dialog-item" onClick={() => onSelectDialog(item.partnerId)}>
            <strong>{item.partnerId}</strong>
            <span>{item.lastMessage}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
