import * as Location from "expo-location";

export type SharedLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export async function getCurrentShareLocation(): Promise<SharedLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Location permission denied");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  const places = await Location.reverseGeocodeAsync({ latitude, longitude });
  const place = places[0];
  const label = place
    ? [place.name, place.city, place.region, place.country]
        .filter(Boolean)
        .join(", ")
    : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  return { latitude, longitude, label };
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
