import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

export default function Welcome() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        alignContent: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <Text style={{ textAlign: "center", fontSize: 30, fontWeight: 700 }}>
        Welcome to Cafe World
      </Text>
      <View style={{ justifyContent: "center", gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Image
            source={{ uri: "https://picsum.photos/200/300" }}
            style={{ width: 200, height: 70, borderRadius: 5 }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Image
            source={{ uri: "https://picsum.photos/200/300" }}
            style={{ width: 200, height: 70, borderRadius: 5 }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Image
            source={{ uri: "https://picsum.photos/200/300" }}
            style={{ width: 200, height: 70, borderRadius: 5 }}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <TouchableOpacity
          style={{
            height: 40,
            width: 150,
            backgroundColor: "#00BDD6",
            justifyContent: "center",
            borderRadius: 5,
          }}
          onPress={() => {
            router.replace("/shops");
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
