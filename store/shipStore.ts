import { create } from "zustand";

export interface ShipStore {
    uniqueShips: Set<string>;
    addShip: (mmsi: string) => void;
    getUniqueShipCount: () => number;
}

export const useShipStore = create<ShipStore>((set) => ({
    uniqueShips: new Set(),

    addShip: (mmsi: string) =>
        set((state) => {
            if (!state.uniqueShips.has(mmsi)) {
                const updatedSet = new Set(state.uniqueShips);
                updatedSet.add(mmsi);
                return { uniqueShips: updatedSet };
            }
            return state;
        }),

    getUniqueShipCount: function () {
        return this.uniqueShips.size;
    },
}));
