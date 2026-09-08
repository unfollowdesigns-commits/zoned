import { Dashboard } from '../components/Dashboard';
import { demoDays } from '../lib/demo';
import { isCloudEnabled } from '../lib/supabase';
import { loadDays } from '../lib/days';

// Metrics are recomputed from raw samples on each request rather than cached,
// so a change to a scoring formula shows up immediately across all history.
export const dynamic = 'force-dynamic';

export default async function Page() {
  const days = isCloudEnabled ? await loadDays() : null;
  const hasData = days !== null && days.length > 0;

  return <Dashboard days={hasData ? days : demoDays()} demo={!hasData} />;
}
