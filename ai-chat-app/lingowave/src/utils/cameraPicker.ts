import * as ImagePicker from "expo-image-picker";

export async function openCamera() {

  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Camera permission denied");
  }

  const result =
    await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}