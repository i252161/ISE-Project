import { useState } from 'react';
import { StartByPage } from './features/start-by/StartByPage';
import { RemainingHoursPage } from './features/remaining-hours/RemainingHoursPage';

export function App() {
  const [activeView, setActiveView] = useState<'home' | 'start-by' | 'remaining-hours'>('home');

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>AI Academic Deadline Planner</h1>
      <p>Walking skeleton (E-01) — static PWA shell ready.</p>
      <nav aria-label="Primary navigation">
        <ul>
          {/* --- Slice navigation links (one line per slice, DL-55) --- */}
          {/* [S-01] Daily availability */}
          {/* [S-02] Course confidence ratings */}
          <li><button type="button" onClick={() => setActiveView('start-by')}>Start-by dates</button></li>
          {/* [S-04] Allocation & shortage suggestions */}
          {/* [S-07] Remaining hours report */}
          <li><button type="button" onClick={() => setActiveView('remaining-hours')}>Remaining hours</button></li>
          {/* [S-08] Assignment status */}
          {/* [S-09] Course-balance & start-by warnings */}
          {/* [S-10] Manual deadline for undated assignments */}
          {/* [S-14] Subtasks */}
          {/* [S-15] Study timer */}
          {/* [S-16] Search, filter & sort */}
          {/* [S-19] Recurring weekly availability baseline */}
        </ul>
      </nav>
      {activeView === 'start-by' && <StartByPage />}
      {activeView === 'remaining-hours' && <RemainingHoursPage />}
    </main>
  );
}
