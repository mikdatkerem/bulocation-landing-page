export const cameraApi = {
  createCamera: (...args: Parameters<typeof import('./adminApi').adminApi.createCamera>) =>
    import('./adminApi').then(({ adminApi }) => adminApi.createCamera(...args)),
  updateCamera: (...args: Parameters<typeof import('./adminApi').adminApi.updateCamera>) =>
    import('./adminApi').then(({ adminApi }) => adminApi.updateCamera(...args)),
  deleteCamera: (...args: Parameters<typeof import('./adminApi').adminApi.deleteCamera>) =>
    import('./adminApi').then(({ adminApi }) => adminApi.deleteCamera(...args)),
  createCameraZone: (...args: Parameters<typeof import('./adminApi').adminApi.createCameraZone>) =>
    import('./adminApi').then(({ adminApi }) => adminApi.createCameraZone(...args)),
  updateCameraZone: (...args: Parameters<typeof import('./adminApi').adminApi.updateCameraZone>) =>
    import('./adminApi').then(({ adminApi }) => adminApi.updateCameraZone(...args)),
  deleteCameraZone: (...args: Parameters<typeof import('./adminApi').adminApi.deleteCameraZone>) =>
    import('./adminApi').then(({ adminApi }) => adminApi.deleteCameraZone(...args)),
};
