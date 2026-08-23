import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  authModal: { isOpen: false, mode: 'login' },
  
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  
  openAuthModal: (mode = 'login') => set({ authModal: { isOpen: true, mode } }),
  closeAuthModal: () => set((s) => ({ authModal: { ...s.authModal, isOpen: false } })),
  switchAuthMode: (mode) => set((s) => ({ authModal: { ...s.authModal, mode } })),
}));

export default useUIStore;
