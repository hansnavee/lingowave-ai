import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<boolean> {
  try {
    await cancelRecording();

    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      return false;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const nextRecording = new Audio.Recording();

    await nextRecording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    await nextRecording.startAsync();
    recording = nextRecording;

    return true;
  } catch {
    recording = null;
    return false;
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    return uri;
  } catch {
    recording = null;
    return null;
  }
}

export async function cancelRecording(): Promise<void> {
  try {
    if (!recording) {
      return;
    }

    await recording.stopAndUnloadAsync();
  } catch {
    // ignore cleanup errors
  } finally {
    recording = null;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch {
      // ignore
    }
  }
}
