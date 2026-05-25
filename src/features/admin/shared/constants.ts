import {
  Activity,
  Building2,
  Compass,
  Map,
  ParkingCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { Option, SidebarKey } from './types/admin.types';

export const ADMIN_SESSION_STORAGE_KEY = 'bulocation.admin.session';
export const CAMERA_ZONE_GRID_SIZE = 24;

export const sidebarItems: { key: SidebarKey; label: string; icon: typeof Activity }[] = [
  { key: 'overview', label: 'Panel', icon: Activity },
  { key: 'organizations', label: 'Organizasyonlar', icon: Building2 },
  { key: 'facilities', label: 'Tesisler', icon: Building2 },
  { key: 'maps', label: 'Haritalar', icon: Map },
  { key: 'parking', label: 'Otopark', icon: ParkingCircle },
  { key: 'cameras', label: 'Kameralar', icon: Compass },
  { key: 'users', label: 'Kullanicilar', icon: Users },
  { key: 'security', label: 'Guvenlik', icon: ShieldCheck },
];

export const siteTypeOptions: Option[] = [
  { value: 1, label: 'Hastane' },
  { value: 2, label: 'Otopark Kampusu' },
  { value: 3, label: 'AVM' },
  { value: 4, label: 'Universite' },
  { value: 5, label: 'Kamu Tesisi' },
  { value: 6, label: 'Karma Kullanim' },
];

export const buildingTypeOptions: Option[] = [
  { value: 1, label: 'Ana Bina' },
  { value: 2, label: 'Klinik' },
  { value: 3, label: 'Acil' },
  { value: 4, label: 'Otopark' },
  { value: 5, label: 'Ofis' },
  { value: 6, label: 'Ek Bina' },
  { value: 99, label: 'Diger' },
];

export const parkingFacilityTypeOptions: Option[] = [
  { value: 1, label: 'Acik Otopark' },
  { value: 2, label: 'Kapali Otopark' },
  { value: 3, label: 'Vale' },
  { value: 4, label: 'Karma' },
];

export const allNodeTypeOptions: Option[] = [
  { value: 1, label: 'Yol Noktasi' },
  { value: 3, label: 'Bina Girisi' },
  { value: 4, label: 'Bina Cikisi' },
  { value: 5, label: 'Asansor' },
  { value: 6, label: 'Merdiven' },
  { value: 7, label: 'Rampa' },
  { value: 8, label: 'Park Yeri' },
  { value: 9, label: 'Otopark Arac Girisi' },
  { value: 10, label: 'Otopark Arac Cikisi' },
  { value: 11, label: 'Kisitli Alan Cizgisi' },
];

export const nodeTypeOptions: Option[] = allNodeTypeOptions.filter(
  (option) => option.value !== 7 && option.value !== 11,
);

export const transitionTypeOptions: Option[] = [
  { value: 1, label: 'GeÃ§iÅŸ' },
  { value: 2, label: 'AsansÃ¶r' },
  { value: 3, label: 'Merdiven' },
  { value: 5, label: 'GiriÅŸ' },
  { value: 6, label: 'Ã‡Ä±kÄ±ÅŸ' },
];

export const transitionConnectorNodeTypes = new Set([3, 4, 5, 6, 9, 10]);
