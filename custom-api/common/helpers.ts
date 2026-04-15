import dayjs from "dayjs";
import { Resp } from "./types.js";

/** Perform transformations on an arbitrary string to try and convert it to an icon slug.
 *
 * @param {string} s - some string to be converted
 */
function convertStringToIconSlug(s: string) {
    return s.toLowerCase().replace(/[\W_]+/g, "-");
}

const selfhstIconUrlCache = new Map();
const MENSA_DATE_FORMAT = "YYYY-MM-DD";

/** Try to obtain a URL to an icon from selfh.st/icons
 *
 * @param {string} name - Name to try to find the icon of
 * @param {string|undefined} fallback - another name to try if nothing is found for `name`. Useful if the primary name field of service x can't always be set to icon slug.
 * @returns {string|null} URL to icon
 */
async function getSelfhstIconUrl(name: string, fallback?: string) {
    const cacheKey = `${name ?? ""}|${fallback ?? ""}`;
    const cachedIconUrl = selfhstIconUrlCache.get(cacheKey);
    if (cachedIconUrl) {
        return cachedIconUrl;
    }

    const iconUrlPromise = (async () => {
        let url = `https://cdn.jsdelivr.net/gh/selfhst/icons/png/${convertStringToIconSlug(name)}.png`;
        let res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
            return url;
        }

        if (fallback) {
            url = `https://cdn.jsdelivr.net/gh/selfhst/icons/png/${convertStringToIconSlug(fallback)}.png`;
            res = await fetch(url, { method: "HEAD" });
        }

        return res.ok ? url : null;
    })();

    selfhstIconUrlCache.set(cacheKey, iconUrlPromise);

    try {
        return await iconUrlPromise;
    } catch (error) {
        selfhstIconUrlCache.delete(cacheKey);
        throw error;
    }
}

function getDateOfDelta(days: number) {
    const today = dayjs().add(days, "day");
    return today.format(MENSA_DATE_FORMAT);
}

async function handleResponse(response: Response): Promise<Resp> {
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

function formatDuration(millis: number) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    if (millis < MINUTE) return `${Math.trunc(millis / SECOND)}s`;
    if (millis < HOUR) return `${Math.trunc(millis / MINUTE)}min`;
    if (millis < DAY) return `${Math.trunc(millis / HOUR)}h`;
    return `${Math.trunc(millis / DAY)}d`;
}

function makeError(message: string) {
    return { error: message }
}

export { makeError, getDateOfDelta, handleResponse, formatDuration, getSelfhstIconUrl };
