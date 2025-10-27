import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { router } from "expo-router";

const CustomerHeader = (props) => {
  console.log(props);

  const { navigation, route, options } = props;

  return (
    <View
      style={{
        height: 40,
        justifyContent: "space-around",
        flexDirection: "row",
      }}
    >
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Text style={{ fontSize: 24 }}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 24 }}>{options?.title}</Text>
      <View>
        <TouchableOpacity
          style={{ justifyContent: "center" }}
          onPress={() => router.replace("/orders")}
        >
          <Text>My Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomerHeader;
