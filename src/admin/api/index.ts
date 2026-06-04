import { adminUsersApi } from './admin-users';
import { authApi } from './auth';
import { camerasApi } from './cameras';
import { facilitiesApi } from './facilities';
import { facilityMapsApi } from './facility-maps';
import { parkingSpotsApi } from './parking-spots';

export * from './errors';
export * from './types';

export const adminApi = {
  ...authApi,
  ...facilitiesApi,
  ...parkingSpotsApi,
  ...camerasApi,
  ...facilityMapsApi,
  ...adminUsersApi,
};
