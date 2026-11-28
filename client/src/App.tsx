import { useState } from 'react';
import { AvailabilityPage } from './features/availability/AvailabilityPage';
import { StartByPage } from './features/start-by/StartByPage';

export function App() {
  const [page, setPage] = useState<'home' | 'availability' | 'start-by'>('home');

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>AI Academic Deadline Planner</h1>
      <p><strong>Sample data</strong></p>
      <nav aria-label="Primary navigation">
        <ul>
          {/* --- Slice navigation links (one line per slice, DL-55) --- */}
          <li><button type="button" onClick={() => setPage('availability')}>Availability</button></li>
          {/* [S-02] Course confidence ratings */}
          <li><button type="button" onClick={() => setPage('start-by')}>Start-by dates</button></li>
          {/* [S-04] Allocation & shortage suggestions */}
          {/* [S-07] Remaining hours report */}
          {/* [S-08] Assignment status */}
          {/* [S-09] Course-balance & start-by warnings */}
          {/* [S-10] Manual deadline for undated assignments */}
          {/* [S-14] Subtasks */}
          {/* [S-15] Study timer */}
          {/* [S-16] Search, filter & sort */}
          {/* [S-19] Recurring weekly availability baseline */}
        </ul>
      </nav>
      {page === 'availability' && <AvailabilityPage />}
      {page === 'start-by' && <StartByPage />}
    </main>
  );
}
