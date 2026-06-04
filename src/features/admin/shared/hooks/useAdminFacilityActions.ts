import type { Dispatch, SetStateAction } from 'react';
import {
  adminApi,
  type BuildingHierarchy,
  type OrganizationSummary,
  type ParkingFacilityHierarchy,
  type SiteHierarchy,
} from '../services/adminApi';
import type {
  BuildingForm,
  FloorForm,
  OrganizationForm,
  ParkingFacilityForm,
  ParkingZoneForm,
  Session,
  SiteForm,
} from '../types/admin.types';

type RunAction = (
  action: () => Promise<void>,
  successMessage: string,
  errorMessage?: string,
) => Promise<void>;

type UseAdminFacilityActionsArgs = {
  session: Session | null;
  organizations: OrganizationSummary[];
  selectedOrganizationId: string;
  organizationForm: OrganizationForm;
  siteForm: SiteForm;
  buildingForm: BuildingForm;
  floorForm: FloorForm;
  parkingFacilityForm: ParkingFacilityForm;
  parkingZoneForm: ParkingZoneForm;
  setOrganizations: Dispatch<SetStateAction<OrganizationSummary[]>>;
  setSelectedOrganizationId: Dispatch<SetStateAction<string>>;
  setOrganizationForm: Dispatch<SetStateAction<OrganizationForm>>;
  setSiteForm: Dispatch<SetStateAction<SiteForm>>;
  setBuildingForm: Dispatch<SetStateAction<BuildingForm>>;
  setFloorForm: Dispatch<SetStateAction<FloorForm>>;
  setParkingFacilityForm: Dispatch<SetStateAction<ParkingFacilityForm>>;
  setParkingZoneForm: Dispatch<SetStateAction<ParkingZoneForm>>;
  refreshHierarchy: (activeSession: Session, organizationId?: string) => Promise<void>;
  runAction: RunAction;
};

export default function useAdminFacilityActions({
  session,
  organizations,
  selectedOrganizationId,
  organizationForm,
  siteForm,
  buildingForm,
  floorForm,
  parkingFacilityForm,
  parkingZoneForm,
  setOrganizations,
  setSelectedOrganizationId,
  setOrganizationForm,
  setSiteForm,
  setBuildingForm,
  setFloorForm,
  setParkingFacilityForm,
  setParkingZoneForm,
  refreshHierarchy,
  runAction,
}: UseAdminFacilityActionsArgs) {
  async function handleCreateOrganization() {
    if (!session) {
      return;
    }

    await runAction(async () => {
      const created = await adminApi.createOrganization(
        session.accessToken,
        organizationForm.name.trim(),
        organizationForm.description.trim(),
      );
      setOrganizations([created, ...organizations]);
      setSelectedOrganizationId(created.id);
      setOrganizationForm({ name: '', description: '' });
      await refreshHierarchy(session, created.id);
    }, 'Organizasyon olusturuldu.');
  }

  async function handleUpdateOrganization(organization: OrganizationSummary) {
    if (!session) {
      return;
    }

    const name = window.prompt('Organizasyon adi', organization.name);
    if (!name?.trim()) {
      return;
    }

    const description = window.prompt('Aciklama', organization.description ?? '') ?? '';

    await runAction(async () => {
      await adminApi.updateOrganization(session.accessToken, organization.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      const refreshed = await adminApi.getOrganizations(session.accessToken);
      setOrganizations(refreshed);
      await refreshHierarchy(session, organization.id);
    }, 'Organizasyon guncellendi.');
  }

  async function handleDeleteOrganization(organizationId: string) {
    if (!session || !window.confirm('Bu organizasyonu silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteOrganization(session.accessToken, organizationId);
      const refreshed = await adminApi.getOrganizations(session.accessToken);
      setOrganizations(refreshed);
      const nextOrganizationId =
        selectedOrganizationId === organizationId ? refreshed[0]?.id || '' : selectedOrganizationId;
      setSelectedOrganizationId(nextOrganizationId);
      await refreshHierarchy(session, nextOrganizationId);
    }, 'Organizasyon silindi.');
  }

  async function handleCreateSite() {
    if (!session || !selectedOrganizationId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createSite(session.accessToken, selectedOrganizationId, {
        code: siteForm.code.trim(),
        name: siteForm.name.trim(),
        siteType: siteForm.siteType,
        address: siteForm.address.trim(),
      });
      setSiteForm({ code: '', name: '', siteType: 1, address: '' });
      await refreshHierarchy(session);
    }, 'Yerleske olusturuldu.');
  }

  async function handleUpdateSite(site: SiteHierarchy) {
    if (!session) {
      return;
    }

    const code = window.prompt('Yerleske kodu', site.code);
    const name = window.prompt('Yerleske adi', site.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    const address = window.prompt('Adres', site.address ?? '') ?? '';

    await runAction(async () => {
      await adminApi.updateSite(session.accessToken, site.id, {
        code: code.trim(),
        name: name.trim(),
        siteType: site.siteType,
        address: address.trim() || null,
      });
      await refreshHierarchy(session);
    }, 'Yerleske guncellendi.');
  }

  async function handleDeleteSite(siteId: string) {
    if (!session || !window.confirm('Bu yerleskeyi silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteSite(session.accessToken, siteId);
      await refreshHierarchy(session);
    }, 'Yerleske silindi.');
  }

  async function handleCreateBuilding() {
    if (!session || !buildingForm.siteId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createBuilding(session.accessToken, buildingForm.siteId, {
        code: buildingForm.code.trim(),
        name: buildingForm.name.trim(),
        buildingType: buildingForm.buildingType,
      });
      setBuildingForm((current) => ({ ...current, code: '', name: '' }));
      await refreshHierarchy(session);
    }, 'Bina olusturuldu.');
  }

  async function handleUpdateBuilding(building: BuildingHierarchy) {
    if (!session) {
      return;
    }

    const code = window.prompt('Bina kodu', building.code);
    const name = window.prompt('Bina adi', building.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateBuilding(session.accessToken, building.id, {
        code: code.trim(),
        name: name.trim(),
        buildingType: building.buildingType,
      });
      await refreshHierarchy(session);
    }, 'Bina guncellendi.');
  }

  async function handleDeleteBuilding(buildingId: string) {
    if (!session || !window.confirm('Bu binayi silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteBuilding(session.accessToken, buildingId);
      await refreshHierarchy(session);
    }, 'Bina silindi.');
  }

  async function handleCreateFloor() {
    if (!session || !floorForm.buildingId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createFloor(session.accessToken, floorForm.buildingId, {
        code: floorForm.code.trim(),
        name: floorForm.name.trim(),
        level: Number(floorForm.level),
      });
      setFloorForm((current) => ({ ...current, code: '', name: '', level: 0 }));
      await refreshHierarchy(session);
    }, 'Kat olusturuldu.');
  }

  async function handleUpdateFloor(floor: { id: string; code: string; name: string; level: number }) {
    if (!session) {
      return;
    }

    const code = window.prompt('Kat kodu', floor.code);
    const name = window.prompt('Kat adi', floor.name);
    const levelValue = window.prompt('Kat seviyesi', String(floor.level));
    if (!code?.trim() || !name?.trim() || levelValue === null) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateFloor(session.accessToken, floor.id, {
        code: code.trim(),
        name: name.trim(),
        level: Number(levelValue),
      });
      await refreshHierarchy(session);
    }, 'Kat guncellendi.');
  }

  async function handleDeleteFloor(floorId: string) {
    if (!session || !window.confirm('Bu kati silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteFloor(session.accessToken, floorId);
      await refreshHierarchy(session);
    }, 'Kat silindi.');
  }

  async function handleCreateParkingFacility() {
    if (!session || !parkingFacilityForm.siteId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createParkingFacility(session.accessToken, parkingFacilityForm.siteId, {
        buildingId: parkingFacilityForm.buildingId || null,
        code: parkingFacilityForm.code.trim(),
        name: parkingFacilityForm.name.trim(),
        facilityType: parkingFacilityForm.facilityType,
      });
      setParkingFacilityForm((current) => ({ ...current, code: '', name: '' }));
      await refreshHierarchy(session);
    }, 'Otopark tesisi olusturuldu.');
  }

  async function handleUpdateParkingFacility(facility: ParkingFacilityHierarchy) {
    if (!session) {
      return;
    }

    const code = window.prompt('Otopark tesis kodu', facility.code);
    const name = window.prompt('Otopark tesis adi', facility.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateParkingFacility(session.accessToken, facility.id, {
        code: code.trim(),
        name: name.trim(),
        buildingId: null,
        facilityType: facility.facilityType,
      });
      await refreshHierarchy(session);
    }, 'Otopark tesisi guncellendi.');
  }

  async function handleDeleteParkingFacility(parkingFacilityId: string) {
    if (!session || !window.confirm('Bu otopark tesisini silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteParkingFacility(session.accessToken, parkingFacilityId);
      await refreshHierarchy(session);
    }, 'Otopark tesisi silindi.');
  }

  async function handleCreateParkingZone() {
    if (!session || !parkingZoneForm.parkingFacilityId) {
      return;
    }

    await runAction(async () => {
      await adminApi.createParkingZone(session.accessToken, parkingZoneForm.parkingFacilityId, {
        floorId: parkingZoneForm.floorId || null,
        code: parkingZoneForm.code.trim(),
        name: parkingZoneForm.name.trim(),
      });
      setParkingZoneForm((current) => ({ ...current, code: '', name: '' }));
      await refreshHierarchy(session);
    }, 'Otopark bolgesi olusturuldu.');
  }

  async function handleUpdateParkingZone(zone: { id: string; code: string; name: string; floorId: string | null }) {
    if (!session) {
      return;
    }

    const code = window.prompt('Bolge kodu', zone.code);
    const name = window.prompt('Bolge adi', zone.name);
    if (!code?.trim() || !name?.trim()) {
      return;
    }

    await runAction(async () => {
      await adminApi.updateParkingZone(session.accessToken, zone.id, {
        code: code.trim(),
        name: name.trim(),
        floorId: zone.floorId,
      });
      await refreshHierarchy(session);
    }, 'Otopark bolgesi guncellendi.');
  }

  async function handleDeleteParkingZone(parkingZoneId: string) {
    if (!session || !window.confirm('Bu otopark bolgesini silmek istediginize emin misiniz?')) {
      return;
    }

    await runAction(async () => {
      await adminApi.deleteParkingZone(session.accessToken, parkingZoneId);
      await refreshHierarchy(session);
    }, 'Otopark bolgesi silindi.');
  }

  return {
    handleCreateOrganization,
    handleUpdateOrganization,
    handleDeleteOrganization,
    handleCreateSite,
    handleUpdateSite,
    handleDeleteSite,
    handleCreateBuilding,
    handleUpdateBuilding,
    handleDeleteBuilding,
    handleCreateFloor,
    handleUpdateFloor,
    handleDeleteFloor,
    handleCreateParkingFacility,
    handleUpdateParkingFacility,
    handleDeleteParkingFacility,
    handleCreateParkingZone,
    handleUpdateParkingZone,
    handleDeleteParkingZone,
  };
}
