import { AssignmentsRoute, useHash } from './features/assignments/AssignmentsRoute';
import { AvailabilityPage } from './features/availability/AvailabilityPage';
import { StartByPage } from './features/start-by/StartByPage';
import { RemainingHoursPage } from './features/remaining-hours/RemainingHoursPage';

export function App() {
  const hash = useHash();
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>AI Academic Deadline Planner</h1>
      <p><strong>Sample data</strong></p>
      <nav aria-label="Primary navigation">
        <ul>
          <li><a href="#/assignments">Assignments</a></li>{/* [E-05] Assignment list */}
          {/* --- Slice navigation links (one line per slice, DL-55) --- */}
          <li><a href="#/availability">Availability</a></li>{/* [S-01] Daily availability */}
          {/* [S-02] Course confidence ratings */}
          <li><a href="#/start-by">Start-by dates</a></li>{/* [S-03] Start-by dates & effort */}
          {/* [S-04] Allocation & shortage suggestions */}
          <li><a href="#/remaining-hours">Remaining hours</a></li>{/* [S-07] Remaining hours report */}
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
      {hash === '#/availability' ? <AvailabilityPage /> : null}{/* [S-01] Availability page (#/availability) */}
      {/* [S-02] Course ratings page (#/courses) */}
      {hash === '#/start-by' ? <StartByPage /> : null}{/* [S-03] Start-by page (#/start-by) */}
      {hash === '#/remaining-hours' ? <RemainingHoursPage /> : null}{/* [S-07] Remaining hours page (#/remaining-hours) */}
    </main>
  );
}
