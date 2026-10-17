export type Coords = { lat: number; lng: number };

/** Ask the browser for the device location once. Rejects with a readable message. */
export function getDeviceLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser can't share location. Enter your state and city instead."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error("Couldn't get your location. Check your browser's location permission.")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
