import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AppText from "../ui/AppText";

interface Props {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export default function ImageViewer({
  visible,
  imageUri,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
    >
      <View style={styles.container}>

        <Image
          source={{ uri: imageUri }}
          resizeMode="contain"
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <AppText weight="700">✕ Close</AppText>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "85%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
});