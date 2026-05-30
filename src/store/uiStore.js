import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));

export default useUIStore;
