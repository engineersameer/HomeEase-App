import { Link } from "expo-router";
import { Text, View, Image } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "green",
      }}
    >
      <Text style={{ color: "white", fontSize: 20 }}>
        Welcome to the FYP App!
      </Text>
      <Text style={{ color: "white", fontSize: 16 }}>
        This is the home screen.
      </Text>

      <Link href={"/about"}>About</Link>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1747134392453-751dfaed2aa3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={{ width: 100, height: 100, marginTop: 50 }}
      />

      <Image
        source={require('@/assets/images/react-logo.png')}
        style={{ width: 20, height: 20, marginTop: 20 }}
      />
    </View>
  );
}
