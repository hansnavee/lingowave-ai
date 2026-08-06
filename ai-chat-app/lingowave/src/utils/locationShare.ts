export type SharedLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

/** Location sharing stub — expo-location omitted from this Vivo-safe APK. */
export async function getCurrentShareLocation(): Promise<SharedLocation> {
  throw new Error("Location sharing is temporarily unavailable on this build.");
}

export function encodeLocationContent(location: SharedLocation): string {
  return JSON.stringify(location);
}

export function decodeLocationContent(
  content: string
): SharedLocation | null {
  try {
    const parsed = JSON.parse(content) as SharedLocation;
    if (
      typeof parsed?.latitude === "number" &&
      typeof parsed?.longitude === "number"
    ) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        label: parsed.label || `${parsed.latitude}, ${parsed.longitude}`,
      };
    }
  } catch {
    // ignore
  }
  return null;
}
