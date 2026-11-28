import { useEffect, useState } from 'react';
import { AssignmentDetailPage } from './AssignmentDetailPage';
import { AssignmentListPage } from './AssignmentListPage';

/**
 * E-05 hash routes, so a link or a reload opens the same page (no router package; DL-55 forbids
 * new packages). `#/assignments` (or no hash) → list, `#/assignments/<id>` → detail.
 * Renders nothing for any other hash, so other pages (#/availability, #/courses) can show instead.
 */
export function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function AssignmentsRoute() {
  const hash = useHash();
  const detail = /^#\/assignments\/([^/]+)$/.exec(hash);
  if (detail) return <AssignmentDetailPage id={decodeURIComponent(detail[1]!)} />;
  // The assignment list is also the home page (no hash).
  if (hash === '' || hash === '#' || hash === '#/' || hash === '#/assignments' || hash === '#/assignments/') {
    return <AssignmentListPage />;
  }
  return null;
}
