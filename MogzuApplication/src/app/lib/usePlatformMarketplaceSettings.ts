import { useEffect, useState } from 'react';
import {
  getPlatformMarketplaceSettings,
  subscribePlatformMarketplaceSettings,
  type PlatformMarketplaceSettings,
} from '@/app/lib/platformMarketplaceSettings';

export function usePlatformMarketplaceSettings(): PlatformMarketplaceSettings {
  const [s, setS] = useState(getPlatformMarketplaceSettings);
  useEffect(() => subscribePlatformMarketplaceSettings(setS), []);
  return s;
}
