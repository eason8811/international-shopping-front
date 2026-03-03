const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:8080";
const DEFAULT_BACKEND_API_PREFIX = "/api/v1";

function normalizePrefix(prefix: string): string {
    const trimmed = prefix.trim();
    if (!trimmed) {
        return DEFAULT_BACKEND_API_PREFIX;
    }

    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function getBackendOrigin(): string {
    return process.env.BACKEND_ORIGIN?.trim() || DEFAULT_BACKEND_ORIGIN;
}

export function getBackendApiPrefix(): string {
    return normalizePrefix(process.env.BACKEND_API_PREFIX ?? DEFAULT_BACKEND_API_PREFIX);
}

export function buildBackendUrl(path: string): URL {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const origin = getBackendOrigin();
    const prefix = getBackendApiPrefix();

    return new URL(`${prefix}${normalizedPath}`, origin);
}

export async function fetchBackend(path: string, init: RequestInit): Promise<Response> {
    return fetch(buildBackendUrl(path), {
        ...init,
        cache: "no-store",
        redirect: "manual",
    });
}
