import { Link, Redirect, Stack, usePathname, type Href } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  const pathname = usePathname();

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const initialPath = params.get("initialPath");

    if (pathname.includes("workspace_iframe") && initialPath) {
      return <Redirect href={initialPath as Href} />;
    }

    if (pathname.includes("workspace_iframe")) {
      return <Redirect href={"/" as Href} />;
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Página não encontrada</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para o início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0F0F14",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F0F0F5",
    fontFamily: "Inter_700Bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#7C3AED",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
});
