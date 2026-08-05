import * as DocumentPicker from "expo-document-picker";

export async function pickDocument() {

  const result =
    await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}