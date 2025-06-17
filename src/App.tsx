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

  // Mobile-first UI
  return (
    <div className="app-mobile">
      <header>
        <span className="plus-icon">+</span> <span>Goal Counters</span>
      </header>
      <main>
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
      </main>
      <footer>
        <Widget />
        <span>Install this app for quick access!</span>
      </footer>
    </div>
  )
}

export default App
