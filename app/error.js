'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Shown when a page crashes while rendering. The rest of the app keeps working.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="state-page" role="alert">
      <h1>Something went wrong on this page</h1>
      <p>It’s not you. Try again, and if it keeps happening, come back in a few minutes.</p>
      <div className="state-actions">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button>
        <Link href="/" className="btn">Go to the home page</Link>
      </div>
    </main>
  );
}
