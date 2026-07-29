import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

interface Props {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = "Procesando..." }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#1d4ed8" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    minWidth: 160,
  },
  text: { marginTop: 12, color: "#334155", fontSize: 14 },
});
