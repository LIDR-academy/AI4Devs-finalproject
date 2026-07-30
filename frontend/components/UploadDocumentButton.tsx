import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

interface Props {
  onCaptured: (imageBase64: string) => void;
  disabled?: boolean;
}

export function UploadDocumentButton({ onCaptured, disabled = false }: Props) {
  async function handlePress() {
    if (disabled) return;

    Alert.alert("Subir informe", "¿Cómo quieres añadir el documento?", [
      { text: "Cámara", onPress: () => pickImage("camera") },
      { text: "Galería", onPress: () => pickImage("library") },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso necesario", "AEnEA necesita este permiso para continuar.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });

    if (!result.canceled && result.assets[0].base64) {
      onCaptured(result.assets[0].base64);
    }
  }

  return (
    <Pressable style={styles.button} onPress={handlePress} disabled={disabled}>
      <Text style={styles.icon}>📷</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  icon: { fontSize: 20 },
});
