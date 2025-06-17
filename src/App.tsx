import './App.css'
import Widget from './widget';
import { useState, useEffect, useRef } from 'react';

interface Counter {
  id: string;
  name: string;
  goal: number;
  count: number;
}

function Timer({ running, time, onStart, onPause, onReset, onSet, initial }: {
  running: boolean;
  time: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSet: (seconds: number) => void;
  initial: number;
}) {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  const [edit, setEdit] = useState(false);
  const [input, setInput] = useState(initial / 60);
  const templateTimes = [
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hr', value: 60 },
    { label: '2 hrs', value: 120 },
  ];
  return (
    <div className="timer">
      <div className="timer-time">{minutes}:{seconds}</div>
      <div className="timer-controls">
        {edit ? (
          <div className="timer-set-group">
            <span className="timer-set-label">Set (min):</span>
            <input
              type="number"
              min={1}
              value={input}
              onChange={e => setInput(Number(e.target.value))}
              className="timer-set-input"
            />
            <button onClick={() => { onSet(input * 60); setEdit(false); }}>OK</button>
            <button onClick={() => setEdit(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEdit(true)}>Set Time</button>
        )}
        {templateTimes.map(t => (
          <button key={t.label} onClick={() => { onSet(t.value * 60); setEdit(false); }}>{t.label}</button>
        ))}
        {running ? (
          <button onClick={onPause}>Pause</button>
        ) : (
          <button onClick={onStart}>Start</button>
        )}
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}

// Confetti component (tiny, minimal)
function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="confetti">
      <span>🎉</span>
    </div>
  );
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// Local array of motivational quotes
const MOTIVATIONAL_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it’s done.", author: "Nelson Mandela" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "With the new day comes new strength and new thoughts.", author: "Eleanor Roosevelt" },
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don’t let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Opportunities don't happen, you create them.", author: "Chris Grosser" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Success doesn’t just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Don’t stop when you’re tired. Stop when you’re done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It’s going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don’t wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "Keep going. Everything you need will come to you.", author: "Unknown" },
  { text: "You are capable of amazing things.", author: "Unknown" },
  { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
  { text: "If you get tired, learn to rest, not to quit.", author: "Banksy" },
  { text: "You don’t have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Difficult roads often lead to beautiful destinations.", author: "Unknown" },
  { text: "Don’t limit your challenges. Challenge your limits.", author: "Unknown" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky" },
  { text: "If you want to achieve greatness stop asking for permission.", author: "Unknown" },
  { text: "Go the extra mile. It’s never crowded.", author: "Wayne Dyer" },
  { text: "Success is what happens after you have survived all your mistakes.", author: "Anora Lee" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "You are stronger than you think.", author: "Unknown" },
  { text: "Stay positive, work hard, make it happen.", author: "Unknown" },
  { text: "Doubt whom you will, but never yourself.", author: "Christian Nestell Bovee" }
];

function App() {
  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('counters');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCounter, setNewCounter] = useState({ name: '', goal: 1 });
  const [timer, setTimer] = useState({ running: false, time: 0, initial: 0 });
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);
  const [confettiId, setConfettiId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    if (!saved) return [];
    const parsed: Todo[] = JSON.parse(saved);
    // Only show today's todos
    return parsed.filter(t => t.date === getToday());
  });
  const [newTodo, setNewTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const confettiTimeout = useRef<number | null>(null);

  // Persist counters
  function saveCounters(newCounters: Counter[]) {
    setCounters(newCounters);
    localStorage.setItem('counters', JSON.stringify(newCounters));
  }

  function addCounter() {
    if (!newCounter.name.trim()) return;
    const counter: Counter = {
      id: Date.now().toString(),
      name: newCounter.name,
      goal: newCounter.goal,
      count: 0,
    };
    saveCounters([...counters, counter]);
    setNewCounter({ name: '', goal: 1 });
  }

  function updateCounter(id: string, changes: Partial<Counter>) {
    const updated = counters.map(c => {
      if (c.id === id) {
        const newCount = changes.count !== undefined ? changes.count : c.count;
        if (c.goal > 0 && newCount >= c.goal && c.count < c.goal) {
          setConfettiId(id);
          if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
          confettiTimeout.current = window.setTimeout(() => setConfettiId(null), 1800);
        }
        return { ...c, ...changes };
      }
      return c;
    });
    saveCounters(updated);
  }

  function removeCounter(id: string) {
    saveCounters(counters.filter(c => c.id !== id));
  }

  function startTimer() {
    if (timerIntervalId || timer.time <= 0) return;
    setTimer(t => ({ ...t, running: true }));
    const id = window.setInterval(() => {
      setTimer(t => {
        if (t.time > 0) return { ...t, time: t.time - 1 };
        window.clearInterval(id);
        return { ...t, running: false, time: 0 };
      });
    }, 1000);
    setTimerIntervalId(id);
  }
  function pauseTimer() {
    if (timerIntervalId) window.clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setTimer(t => ({ ...t, running: false }));
  }
  function resetTimer() {
    if (timerIntervalId) window.clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setTimer(t => ({ ...t, running: false, time: t.initial }));
  }
  function setTimerValue(seconds: number) {
    if (timerIntervalId) window.clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setTimer({ running: false, time: seconds, initial: seconds });
  }
  useEffect(() => {
    return () => {
      if (confettiTimeout.current) window.clearTimeout(confettiTimeout.current);
      if (timerIntervalId) window.clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

  // Add a template counter for cold msg/reach out
  function addTemplateCounter() {
    const exists = counters.some(c => c.name === 'Cold Msg/Reach Out');
    if (exists) return;
    const counter: Counter = {
      id: Date.now().toString(),
      name: 'Cold Msg/Reach Out',
      goal: 25,
      count: 0,
    };
    saveCounters([...counters, counter]);
  }

  // Persist todos for today only
  function saveTodos(newTodos: Todo[]) {
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  }

  function addTodo() {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      date: getToday(),
    };
    saveTodos([...todos, todo]);
    setNewTodo('');
  }

  function toggleTodo(id: string) {
    saveTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function removeTodo(id: string) {
    saveTodos(todos.filter(t => t.id !== id));
  }

  function startEditTodo(id: string, text: string) {
    setEditingTodoId(id);
    setEditingTodoText(text);
  }

  function saveEditTodo(id: string) {
    saveTodos(todos.map(t => t.id === id ? { ...t, text: editingTodoText } : t));
    setEditingTodoId(null);
    setEditingTodoText('');
  }

  // Request notification permission on load
  useEffect(() => {
    if (Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Schedule a notification for the next morning and every 24h
  useEffect(() => {
    if (Notification && Notification.permission === 'granted') {
      // Clear any previous timeouts
      let timeoutId: number | null = null;
      function scheduleNextNotification() {
        const now = new Date();
        const nextMorning = new Date(now);
        nextMorning.setHours(8, 0, 0, 0); // 8:00 AM
        if (now > nextMorning) {
          nextMorning.setDate(nextMorning.getDate() + 1);
        }
        const msUntilNext = nextMorning.getTime() - now.getTime();
        timeoutId = window.setTimeout(() => {
          new Notification('Daily Reminder', {
            body: 'Don’t forget to complete your counters and reach your goals today!'
          });
          // Schedule the next notification in 24h
          timeoutId = window.setTimeout(scheduleNextNotification, 24 * 60 * 60 * 1000);
        }, msUntilNext);
      }
      scheduleNextNotification();
      return () => { if (timeoutId) window.clearTimeout(timeoutId); };
    }
  }, []);

  // Pick a random quote on each load
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  // Mobile-first UI
  return (
    <div className="app-mobile">
      {/* No header for minimalist look */}
      <div className="quote-box">
        <div className="quote-text">
          “{randomQuote.text}”
          <div className="quote-author">
            — {randomQuote.author}
          </div>
        </div>
      </div>
      <main className="main-section">
        <section className="counters">
          <h2>Counters</h2>
          <button className="template-btn" onClick={addTemplateCounter}>
            + Add Cold Msg/Reach Out (25)
          </button>
          <div className="counter-list">
            {counters.length === 0 && <div className="counter-empty">No counters</div>}
            {counters.map(counter => (
              <div className="counter-item" key={counter.id}>
                <Confetti show={confettiId === counter.id} />
                {editingId === counter.id ? (
                  <>
                    <input
                      value={counter.name}
                      onChange={e => updateCounter(counter.id, { name: e.target.value })}
                    />
                    <input
                      type="number"
                      min={1}
                      value={counter.goal}
                      onChange={e => updateCounter(counter.id, { goal: Number(e.target.value) })}
                    />
                    <button onClick={() => setEditingId(null)}>Save</button>
                  </>
                ) : (
                  <>
                    <span className="counter-name">{counter.name}</span>
                    <span className="counter-progress">{counter.count}/{counter.goal}</span>
                    <button onClick={() => updateCounter(counter.id, { count: Math.max(0, counter.count - 1) })}>-</button>
                    <button onClick={() => updateCounter(counter.id, { count: counter.count + 1 })}>+</button>
                    <button onClick={() => setEditingId(counter.id)}>Edit</button>
                    <button onClick={() => removeCounter(counter.id)}>Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="add-counter">
            <input
              placeholder="Task name"
              value={newCounter.name}
              onChange={e => setNewCounter(nc => ({ ...nc, name: e.target.value }))}
            />
            <input
              type="number"
              min={1}
              value={newCounter.goal}
              onChange={e => setNewCounter(nc => ({ ...nc, goal: Number(e.target.value) }))}
            />
            <button onClick={addCounter}>Add</button>
          </div>
        </section>
        <section className="timer-section">
          <h2>Timer</h2>
          <Timer
            running={timer.running}
            time={timer.time}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onSet={setTimerValue}
            initial={timer.initial}
          />
        </section>
        <section className="todos">
          <h2>Todo List</h2>
          <div className="add-todo">
            <input
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
            />
            <button onClick={addTodo}>Add</button>
          </div>
          <div className="todo-list">
            {todos.length === 0 && <div className="todo-empty">No tasks for today</div>}
            {todos.map(todo => (
              <div className="todo-item" key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                {editingTodoId === todo.id ? (
                  <>
                    <input
                      value={editingTodoText}
                      onChange={e => setEditingTodoText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEditTodo(todo.id); }}
                      className="todo-edit-input"
                    />
                    <button onClick={() => saveEditTodo(todo.id)}>Save</button>
                    <button onClick={() => setEditingTodoId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span
                      className={
                        'todo-text' + (todo.completed ? ' todo-completed' : '')
                      }
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.text}
                    </span>
                    <button onClick={() => startEditTodo(todo.id, todo.text)}>Edit</button>
                    <button onClick={() => removeTodo(todo.id)}>Remove</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer-section">
        <Widget />
        <span>Install this app for quick access!</span>
      </footer>
    </div>
  )
}

export default App
