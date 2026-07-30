import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { getStoredPatientId } from "@/services/patientStore";

export default function Index() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const patientId = await getStoredPatientId();
      if (patientId) {
        router.replace("/timeline");
      } else {
        router.replace("/onboarding");
      }
      setChecked(true);
    })();
  }, [router]);

  if (!checked) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
