import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const Chat = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈 화면</Text>
      <Button
        title="상세 화면으로 이동"
        onPress={() => navigation.navigate("Details")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default Chat;
