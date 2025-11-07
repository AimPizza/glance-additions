import type { HandledResponse } from "./types.js";

async function handleResponse<T>(
    response: Response
): Promise<HandledResponse<T>> {
    if (!response.ok) return { ok: false, status: response.status };
    try {
        const data = (await response.json()) as T;
        return { ok: true, status: response.status, value: data };
    } catch {
        return { ok: false, status: 500 };
    }
}

function getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export { handleResponse, getCurrentDate };
