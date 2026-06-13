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

export interface PangolinTarget {
    targetId: number;
    ip: string;
    port: number;
    enabled: boolean;
    healthStatus: string;
}
export interface PangolinResource {
    // didn't know what may come in place of any here
    resourceId: number;
    niceId: string;
    name: string;
    ssl: boolean;
    fullDomain: string;
    passwordId: any;
    sso: boolean;
    pincodeId: any;
    whitelist: boolean;
    http: boolean;
    protocol: string;
    proxyPort: any;
    enabled: boolean;
    domainId: string;
    headerAuthId: any;
    targets: PangolinTarget[];
}

export interface PangolinResources {
    data: {
        resources: PangolinResource[];
        pagination: {
            total: number;
            pageSize: number;
            page: number;
        };
    };
    success: boolean;
    error: boolean;
    message: string;
    status: number;
}

export interface PangolinResponseObj {
    name: string;
    url: string;
    healthStatus: string;
    iconUrl?: string;
}
