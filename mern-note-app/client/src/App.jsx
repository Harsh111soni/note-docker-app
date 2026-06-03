import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      loadNotes();
    }
  }, [token]);

  async function loadNotes() {
    setLoading(true);
    const response = await fetch(`${API_BASE}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setNotes(data);
    } else {
      handleLogout();
    }
    setLoading(false);
  }

  async function handleNoteSubmit(event) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = { title, content };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    if (editing) {
      const response = await fetch(`${API_BASE}/notes/${editing._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map((note) => (note._id === updatedNote._id ? updatedNote : note)));
        setEditing(null);
      }
    } else {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const createdNote = await response.json();
        setNotes([createdNote, ...notes]);
      }
    }

    setTitle('');
    setContent('');
  }

  function startEdit(note) {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
  }

  async function deleteNote(id) {
    const response = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      setNotes(notes.filter((note) => note._id !== id));
      if (editing?._id === id) {
        setEditing(null);
        setTitle('');
        setContent('');
      }
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');

    const endpoint = authMode === 'signup' ? 'auth/signup' : 'auth/login';
    const payload = {
      email: authForm.email,
      password: authForm.password,
      ...(authMode === 'signup' ? { name: authForm.name } : {})
    };

    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setAuthError(result.message || 'Authentication failed');
      return;
    }

    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setAuthForm({ name: '', email: '', password: '' });
    setAuthError('');
  }

  function handleLogout() {
    setToken('');
    setUser(null);
    setNotes([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setEditing(null);
    setTitle('');
    setContent('');
  }

  if (!token || !user) {
    return (
      <div className="app-container">
        <header>
          <h1>Website</h1>
          <p>Log in or sign up to manage your notes.</p>
        </header>

        <section className="form-section auth-section">
          <div className="auth-switch">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'signup' ? 'active' : ''}
              onClick={() => {
                setAuthMode('signup');
                setAuthError('');
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && (
              <input
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                placeholder="Name"
              />
            )}
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              placeholder="Email"
            />
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              placeholder="Password"
            />
            <button type="submit">{authMode === 'signup' ? 'Create Account' : 'Login'}</button>
            {authError && <p className="error-message">{authError}</p>}
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Note Maker</h1>
        <p>Welcome back, {user.name}. Create, edit, and delete your notes.</p>
      </header>

      <div className="top-bar">
        <span>Signed in as {user.email}</span>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <section className="form-section">
        <form onSubmit={handleNoteSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contents"
            rows="6"
          />
          <button type="submit">{editing ? 'Update Note' : 'Create Note'}</button>
          {editing && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setEditing(null);
                setTitle('');
                setContent('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="notes-section">
        <h2>Your Notes</h2>
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Add one above.</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article key={note._id} className="note-card">
                <div className="note-header">
                  <strong>{note.title}</strong>
                  <div className="note-actions">
                    <button onClick={() => startEdit(note)}>Edit</button>
                    <button className="delete-button" onClick={() => deleteNote(note._id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <p>{note.content}</p>
                <span>{new Date(note.createdAt).toLocaleString()}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
