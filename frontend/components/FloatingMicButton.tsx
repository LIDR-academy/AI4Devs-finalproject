import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useVoiceNoteRecorder } from "@/services/audioRecorder";

interface Props {
  onRecorded: (uri: string) => void;
  disabled?: boolean;
}

export function FloatingMicButton({ onRecorded, disabled = false }: Props) {
  const { start, stop, isRecording } = useVoiceNoteRecorder();
  const [busy, setBusy] = useState(false);

  async function handlePress() {
    if (disabled || busy) return;

    if (!isRecording) {
      setBusy(true);
      try {
        await start();
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const uri = await stop();
      if (uri) onRecorded(uri);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      style={[styles.button, isRecording && styles.buttonRecording]}
      onPress={handlePress}
      disabled={disabled || busy}
    >
      <Text style={styles.icon}>{isRecording ? "⏹" : "🎙️"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonRecording: { backgroundColor: "#DC2626" },
  icon: { fontSize: 26 },
});
