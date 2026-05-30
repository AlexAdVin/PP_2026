export default async function reverseGeoCode(latitude: number, longitude: number) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY;

  if (!apiKey) {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    return data?.results?.[0]?.formatted_address ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  } catch (error) {
    console.error("reverseGeoCode", error);
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }
}