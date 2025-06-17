import React, { useState, useEffect } from 'react';
import './Widget.css';

interface Counter {
  id: string;
  name: string;
  goal: number;
  count: number;
}

// Minimal widget-like component for home screen quick view
const Widget: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('counters');
    setCounters(saved ? JSON.parse(saved) : []);
  }, []);

  // Show only the first 2 counters for compactness
  return (
    <div className="widget-box">
      <span className="widget-plus">+</span>
      <div className="widget-counters">
        {counters.length === 0 && <div className="widget-empty">No counters</div>}
        {counters.slice(0, 2).map(c => (
          <div className="widget-counter" key={c.id}>
            <span className="widget-name">{c.name}</span>
            <span className="widget-progress">{c.count}/{c.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Widget;
