import * as ImagePicker from "expo-image-picker";

export async function pickImage() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Gallery permission denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: false,
    selectionLimit: 1,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}