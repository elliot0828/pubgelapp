import { View, Text, StyleSheet, Image } from "react-native";

const Gpt = ({ route }) => {
  return (
    <View style={styles.container}>
      <Image source={route.params.img} style={styles.image} />
      <Text style={styles.title}>{route.params.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 200, height: 200, marginBottom: 20 }, // 이미지 크기
  title: { fontSize: 24, fontWeight: "bold" },
});

export default Gpt;
