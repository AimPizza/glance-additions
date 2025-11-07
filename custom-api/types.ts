export interface HandledResponse<T = unknown> {
    ok: boolean;
    status: number;
    value?: T;
}

export interface MensaMeal {
    id: number;
    name: string;
    category: string;
    prices: {
        students: number | null;
        employees: number | null;
        pupils: number | null;
        others: number | null;
    };
    notes: string[];
}

export interface MensaCanteen {
    id: number;
    name: string;
    address: string;
    coordinates?: [number, number];
}

export interface SyncthingDevice {
    deviceID: string;
    name: string;
    sinceLastSeen?: string;
}

export interface SyncthingDeviceStats {
    lastSeen: string;
}

export interface DeviceResponse {
    name: string;
    sinceLastSeen: string;
}
