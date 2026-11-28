import { AssignmentsRoute } from './features/assignments/AssignmentsRoute';

export function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>AI Academic Deadline Planner</h1>
      <nav aria-label="Primary navigation">
        <ul>
          <li><a href="#/assignments">Assignments</a></li>{/* [E-05] Assignment list */}
          {/* --- Slice navigation links (one line per slice, DL-55) --- */}
          {/* [S-01] Daily availability */}
          {/* [S-02] Course confidence ratings */}
          {/* [S-03] Start-by dates & effort */}
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
      {/* --- Pages (one line per page). Each page shows itself only for its own #/<page> hash (DL-59). --- */}
      <AssignmentsRoute />{/* [E-05] #/assignments and #/assignments/<id> */}
      {/* [S-01] Availability page (#/availability) */}
      {/* [S-02] Course ratings page (#/courses) */}
    </main>
  );
}
