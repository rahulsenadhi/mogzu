import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth';

import {

  getCorporateDashboardPreferences,

  loadCorporateDashboardPreferences,

  subscribeCorporateDashboardPreferences,

  type CorporateDashboardPreferences,

} from '@/app/lib/corporateDashboardPreferences';



export function useCorporateDashboardPreferences(): CorporateDashboardPreferences {

  const { profile, user } = useAuth();
  const userId = profile?.id ?? user?.id ?? null;

  const [p, setP] = useState(getCorporateDashboardPreferences);



  useEffect(() => {

    let cancelled = false;

    loadCorporateDashboardPreferences(userId).then((loaded) => {

      if (!cancelled) setP(loaded);

    });

    return () => {

      cancelled = true;

    };

  }, [userId]);



  useEffect(() => subscribeCorporateDashboardPreferences(setP), []);



  return p;

}


