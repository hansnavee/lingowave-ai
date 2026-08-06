/** Recording stub — expo-av removed from Android APK to stop cold-start crashes. */

export async function startRecording(): Promise<boolean> {
  return false;
}

export async function stopRecording(): Promise<string | null> {
  return null;
}

export async function cancelRecording(): Promise<void> {
  // no-op
}
