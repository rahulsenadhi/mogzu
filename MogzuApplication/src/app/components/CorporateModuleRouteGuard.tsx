import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { getModuleCorporateState, type MarketplaceModuleKey } from '@/app/lib/platformMarketplaceSettings';
import { usePlatformMarketplaceSettings } from '@/app/lib/usePlatformMarketplaceSettings';

export function CorporateModuleRouteGuard({
  moduleKey,
  children,
}: {
  moduleKey: MarketplaceModuleKey;
  children: ReactNode;
}) {
  usePlatformMarketplaceSettings();
  const state = getModuleCorporateState(moduleKey);
  if (state !== 'live') return <Navigate to="/activitysuite" replace />;
  return <>{children}</>;
}
