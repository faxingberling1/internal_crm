/**
 * Normalizes an IP address by removing IPv6-mapping prefixes (::ffff:).
 */
export function normalizeIP(ip: string): string {
    if (!ip) return '127.0.0.1';

    // Handle IPv6 localhost
    if (ip === '::1') return '127.0.0.1';

    // Remove IPv6-mapped IPv4 prefix
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }

    return ip;
}

/**
 * Checks if a normalized IP address is within the authorized office range.
 * @param ip The client IP to check.
 * @param allowedIP Optional specific IP allowed (e.g., from DB settings).
 */
export function isInOfficeRange(ip: string, allowedIP?: string | null): boolean {
    const normalizedIP = normalizeIP(ip);

    // 1. Match specific allowed IP (Public IP)
    if (allowedIP && normalizeIP(allowedIP) === normalizedIP) return true;

    // 2. Allow loopback
    if (normalizedIP === '127.0.0.1') return true;

    // 3. Match internal office subnet (192.168.18.1-100)
    const ipParts = normalizedIP.split('.');
    if (ipParts.length !== 4) return false;

    const [oct1, oct2, oct3, oct4] = ipParts.map(Number);

    if (oct1 === 192 && oct2 === 168 && oct3 === 18) {
        return oct4 >= 1 && oct4 <= 100;
    }

    return false;
}

/**
 * Checks if the current time is within the authorized office hours.
 * @param startTime Format: "HH:mm" (e.g., "09:00")
 * @param endTime Format: "HH:mm" (e.g., "18:00")
 * @param offset UTC offset in hours (default: 5 for Karachi)
 */
export function isInOfficeHours(startTime: string, endTime: string, offset: number = 5): boolean {
    if (!startTime || !endTime) return true;

    const now = new Date();
    // Calculate target time using UTC + offset
    const targetTime = new Date(now.getTime() + (offset * 60 * 60 * 1000));

    const currentHour = targetTime.getUTCHours();
    const currentMin = targetTime.getUTCMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

    console.log(`[Security] Validating hours: Current ${currentTimeStr} (Offset ${offset}) | Range ${startTime}-${endTime}`);

    if (startTime <= endTime) {
        // Standard range (e.g., 09:00 - 18:00)
        return currentTimeStr >= startTime && currentTimeStr <= endTime;
    } else {
        // Overnight range (e.g., 19:00 - 09:00)
        // Matches if time is AFTER start OR BEFORE end
        return currentTimeStr >= startTime || currentTimeStr <= endTime;
    }
}
