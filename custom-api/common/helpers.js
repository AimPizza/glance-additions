function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

async function handleResponse(response) {
    if (response.ok) {
        try {
            const data = await response.json();
            return { ok: true, status: 200, value: data };
        } catch (e) {
            return { ok: false, status: 500 };
        }
    }

    return { ok: false, status: response.status };
}

function formatDuration(millis) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    if (millis < MINUTE) return `${Math.trunc(millis / SECOND)}s`;
    if (millis < HOUR) return `${Math.trunc(millis / MINUTE)}min`;
    if (millis < DAY) return `${Math.trunc(millis / HOUR)}h`;
    return `${Math.trunc(millis / DAY)}d`;
}

export { getCurrentDate, handleResponse, formatDuration };
