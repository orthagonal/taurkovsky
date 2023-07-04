/*
  contains some useful mocks to simulate the JS tauri API
*/

export const mockFs = (tauriFs) => {
  tauriFs.readDir = async(dir) => {
    alert('tauri reddir!!!' + dir);
  }
};

export const mockPath = (tauriFs) => {
  tauriFs.appDir = async() => 'C:\Users\ortha\AppData\Roaming\taurkovsky';
};
