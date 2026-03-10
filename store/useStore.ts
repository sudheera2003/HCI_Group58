import { create } from "zustand";
import { nanoid } from "nanoid";

// DATA TYPES

export type RoomData = {
  width: number;
  length: number;
  wallColor: string;
  floorColor: string;
};

export type FurnitureType = "chair" | "table" | "bed" | "cupboard" | "round_table" | "sofa";

export type WallItem = {
  id: string;
  width: number;
  height: number;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

export type DoorItem = {
  id: string;
  wallId: string;
  offset: number;
  width: number;
  height: number;
};

export type FurnitureItem = {
  id: string;
  type: FurnitureType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
};

// Snapshot Type for History
type HistorySnapshot = {
  room: RoomData;
  walls: WallItem[];
  doors: DoorItem[];
  furniture: FurnitureItem[];
};

// STATE INTERFACE

interface AppState {
  // State
  room: RoomData;
  walls: WallItem[];
  doors: DoorItem[];
  furniture: FurnitureItem[];
  selectedId: string | null;

  // History State (NEW)
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // UI State
  is2D: boolean;
  isDragging: boolean;
  transformMode: "translate" | "rotate" | "scale";
  isZoomEnabled: boolean;

  // Project Metadata
  projectId: string | null;
  projectName: string;

  // History Actions (NEW)
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Actions
  setRoom: (updates: Partial<RoomData>) => void;

  // Furniture Actions
  addFurniture: (type: FurnitureType) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  removeFurniture: (id: string) => void;

  // Wall Actions
  addWall: () => void;
  updateWall: (id: string, updates: Partial<WallItem>) => void;
  removeWall: (id: string) => void;

  // Door Actions
  addDoor: (wallId: string) => void;
  updateDoor: (id: string, updates: Partial<DoorItem>) => void;
  removeDoor: (id: string) => void;

  // General Actions
  selectItem: (id: string | null) => void;
  toggleViewMode: () => void;
  setDragging: (isDragging: boolean) => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
  rotateItem: (id: string, type: "wall" | "furniture") => void;
  snapItem: (id: string, type: "wall" | "furniture") => void;

  // Data Persistence
  loadDesign: (data: {
    room: RoomData;
    furniture: FurnitureItem[];
    walls?: WallItem[];
    doors?: DoorItem[];
  }) => void;
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setZoomEnabled: (enabled: boolean) => void;
  reset: () => void;
}

// STORE IMPLEMENTATION

export const useStore = create<AppState>((set, get) => ({
  // Defaults
  room: { width: 20, length: 20, wallColor: "#ffffff", floorColor: "#808080" },
  walls: [],
  doors: [],
  furniture: [],
  selectedId: null,

  // History Defaults
  past: [],
  future: [],

  is2D: false,
  isDragging: false,
  transformMode: "translate",
  isZoomEnabled: true,
  projectId: null,
  projectName: "Untitled Project",

  // HISTORY LOGIC
  saveHistory: () => {
    const state = get();
    // Create a snapshot of current data
    const snapshot: HistorySnapshot = {
      room: state.room,
      walls: state.walls,
      doors: state.doors,
      furniture: state.furniture,
    };

    set((state) => ({
      past: [...state.past, snapshot].slice(-20), // Keep last 20 steps
      future: [], // Clearing future
    }));
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state; // Nothing to undo

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);

      // Current state becomes "Future"
      const currentSnapshot: HistorySnapshot = {
        room: state.room,
        walls: state.walls,
        doors: state.doors,
        furniture: state.furniture,
      };

      return {
        ...state,
        past: newPast,
        future: [currentSnapshot, ...state.future],
        // Restore Data
        room: previous.room,
        walls: previous.walls,
        doors: previous.doors,
        furniture: previous.furniture,
        selectedId: null, // Deselect to prevent bugs
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state; // Nothing to redo

      const next = state.future[0];
      const newFuture = state.future.slice(1);

      // Current state becomes Past
      const currentSnapshot: HistorySnapshot = {
        room: state.room,
        walls: state.walls,
        doors: state.doors,
        furniture: state.furniture,
      };

      return {
        ...state,
        past: [...state.past, currentSnapshot],
        future: newFuture,
        // Restore Data
        room: next.room,
        walls: next.walls,
        doors: next.doors,
        furniture: next.furniture,
        selectedId: null,
      };
    });
  },

  // ROOM ACTIONS
  setRoom: (updates) => {
    get().saveHistory(); // Save History
    set((state) => ({ room: { ...state.room, ...updates } }));
  },

  // FURNITURE ACTIONS
  addFurniture: (type) => {
    get().saveHistory(); //Save History
    set((state) => ({
      furniture: [
        ...state.furniture,
        {
          id: nanoid(),
          type,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: "#ffffff",
        },
      ],
    }));
  },

  updateFurniture: (id, updates) => {
    get().saveHistory();

    set((state) => ({
      furniture: state.furniture.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    }));
  },

  removeFurniture: (id) => {
    get().saveHistory(); //Save History
    set((state) => ({
      furniture: state.furniture.filter((item) => item.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  // WALL ACTIONS
  addWall: () => {
    get().saveHistory(); // Save History
    set((state) => ({
      walls: [
        ...state.walls,
        {
          id: nanoid(),
          width: 10,
          height: 8,
          color: "#e2e8f0",
          position: [0, 4, 0],
          rotation: [0, 0, 0],
        },
      ],
    }));
  },

  updateWall: (id, updates) => {
    get().saveHistory(); //Save History
    set((state) => ({
      walls: state.walls.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  },

  removeWall: (id) => {
    get().saveHistory(); //Save History
    set((state) => ({
      doors: state.doors.filter((d) => d.wallId !== id), // Cleanup doors
      walls: state.walls.filter((w) => w.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  // DOOR ACTIONS
  addDoor: (wallId) => {
    get().saveHistory(); // Save History
    set((state) => ({
      doors: [
        ...state.doors,
        {
          id: nanoid(),
          wallId,
          offset: 2,
          width: 3,
          height: 7,
        },
      ],
    }));
  },

  updateDoor: (id, updates) => {
    get().saveHistory(); // Save History
    set((state) => ({
      doors: state.doors.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  },

  removeDoor: (id) => {
    get().saveHistory(); // Save History
    set((state) => ({
      doors: state.doors.filter((d) => d.id !== id),
    }));
  },

  //GENERAL ACTIONS
  selectItem: (id) => set({ selectedId: id }),
  toggleViewMode: () => set((state) => ({ is2D: !state.is2D })),
  setDragging: (isDragging) => set({ isDragging }),
  setTransformMode: (mode) => set({ transformMode: mode }),

  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  setZoomEnabled: (enabled) => set({ isZoomEnabled: enabled }),

  // DATA LOADING
  loadDesign: (data) =>
    set({
      room: data.room,
      furniture: data.furniture,
      walls: data.walls || [],
      doors: data.doors || [],
      past: [], // Clear history on new load
      future: [], // Clear future on new load
    }),

  reset: () =>
    set({
      room: {
        width: 20,
        length: 20,
        wallColor: "#ffffff",
        floorColor: "#808080",
      },
      furniture: [],
      walls: [],
      doors: [],
      past: [],
      future: [],
      selectedId: null,
      projectId: null,
      projectName: "Untitled Project",
      is2D: false,
    }),

  rotateItem: (id, type) => {
    get().saveHistory(); // Save History
    set((state) => {
      const PI_2 = Math.PI / 2;
      if (type === "wall") {
        return {
          walls: state.walls.map((w) => {
            if (w.id !== id) return w;
            const newY = w.rotation[1] + PI_2;
            return { ...w, rotation: [0, newY, 0] };
          }),
        };
      } else {
        return {
          furniture: state.furniture.map((f) => {
            if (f.id !== id) return f;
            const newY = f.rotation[1] + PI_2;
            return { ...f, rotation: [f.rotation[0], newY, f.rotation[2]] };
          }),
        };
      }
    });
  },

  snapItem: (id, type) => {
    get().saveHistory(); // Save History
    set((state) => {
      const snapFurniture = (val: number) => Math.round(val * 2) / 2;
      const snapWall = (val: number) => Math.round(val * 4) / 4;

      if (type === "wall") {
        return {
          walls: state.walls.map((w) =>
            w.id === id
              ? {
                  ...w,
                  position: [
                    snapWall(w.position[0]),
                    w.position[1],
                    snapWall(w.position[2]),
                  ],
                  rotation: [
                    0,
                    Math.round(w.rotation[1] / (Math.PI / 2)) * (Math.PI / 2),
                    0,
                  ],
                }
              : w,
          ),
        };
      } else {
        return {
          furniture: state.furniture.map((f) =>
            f.id === id
              ? {
                  ...f,
                  position: [
                    snapFurniture(f.position[0]),
                    f.position[1],
                    snapFurniture(f.position[2]),
                  ],
                  rotation: [
                    f.rotation[0],
                    Math.round(f.rotation[1] / (Math.PI / 2)) * (Math.PI / 2),
                    f.rotation[2],
                  ],
                }
              : f,
          ),
        };
      }
    });
  },
}));