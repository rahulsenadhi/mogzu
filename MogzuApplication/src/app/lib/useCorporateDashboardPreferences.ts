import { useEffect, useState } from 'react';
import {
  getCorporateDashboardPreferences,
  subscribeCorporateDashboardPreferences,
  type CorporateDashboardPreferences,
} from '@/app/lib/corporateDashboardPreferences';

export function useCorporateDashboardPreferences(): CorporateDashboardPreferences {
  const [p, setP] = useState(getCorporateDashboardPreferences);
  useEffect(() => subscribeCorporateDashboardPreferences(setP), []);
  return p;
}
