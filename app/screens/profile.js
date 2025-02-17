import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");
const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlNTRiYTY1MC1lM2VhLTAxM2EtMWVjNy02YmM5MzNkNDQ3NzciLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjU3NjE0NjY1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InB1Ymctc3RhdC1ib3QifQ.2rKXN9meNKkC88vG54GcneCFNTBteBFVFAUPgi7ca_0";
const Profile = () => {
  const images = [
    {
      src: require("../../assets/images/statResult/normal.png"),
      title: "일반전 전적 검색 예시",
    },
    {
      src: require("../../assets/images/statResult/ranked.png"),
      title: "경쟁전 전적 검색 예시",
    },
  ];

  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });
  const navigation = useNavigation();
  const [ign, setNickname] = useState("");
  const [platform, setPlatform] = useState("steam");
  const [seasonList, setSeasonList] = useState([]);

  useEffect(() => {
    const fetchSeasonList = async () => {
      try {
        const response = await fetch(
          `https://api.pubg.com/shards/${platform}/seasons`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              Accept: "application/vnd.api+json",
            },
          }
        );
        const data = await response.json();

        const currentSeason = data.data.find(
          (season) =>
            season.attributes.isCurrentSeason &&
            season.id.includes("division.bro.official.pc")
        );

        if (!currentSeason) return;

        const lastestSeasonID = Number(
          currentSeason.id.replace("division.bro.official.pc-2018-", "")
        );

        const generatedSeasons = Array.from(
          { length: lastestSeasonID },
          (_, i) => {
            const num = lastestSeasonID - i;
            return {
              num,
              text: `시즌 ${num}`,
              id: {
                steam: `division.bro.official.pc-2018-${
                  num < 10 ? "0" + num : num
                }`,
                kakao: `division.bro.official.pc-2018-${
                  num < 10 ? "0" + num : num
                }`,
                xbox: `division.bro.official.console-2018-${
                  num < 10 ? "0" + num : num
                }`,
                psn: `division.bro.official.console-2018-${
                  num < 10 ? "0" + num : num
                }`,
              },
            };
          }
        );

        setSeasonList(generatedSeasons);
      } catch (error) {
        console.error("Error fetching season list:", error);
      }
    };

    fetchSeasonList();
  }, [platform]);

  const handleSearch = () => {
    if (ign.trim()) {
      navigation.navigate("PlayerStats", { ign, platform, seasonList });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <Text
            style={{
              textAlign: "center",
              color: "white",

              fontFamily: "BrigendsExpanded",
              fontSize: 25,
              color: "rgb(241,249,88)",
            }}
          >
            PUBG STATS
          </Text>
        </View>
        <Carousel
          loop
          width={width}
          height={height * 0.35}
          autoPlay={true}
          autoPlayInterval={3000}
          data={images}
          scrollAnimationDuration={800}
          renderItem={({ item }) => (
            <View style={{ alignItems: "center" }}>
              <Image
                source={item.src}
                style={{
                  height: 200,
                  resizeMode: "contain",
                  borderRadius: 10,
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontFamily: "Pretendard-Bold",
                  fontSize: 15,
                }}
              >
                {item.title}
              </Text>
            </View>
          )}
        />
        <Text style={styles.platformTitle}>PUBG 플랫폼</Text>
        <View style={styles.platformContainer}>
          {["steam", "kakao", "xbox", "psn"].map((plat) => (
            <TouchableOpacity
              key={plat}
              style={styles.platformBTN}
              onPress={() => setPlatform(plat)}
            >
              <Text style={styles.platformTEXT}>{plat.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ignTitle}>PUBG 닉네임</Text>
        <TextInput
          placeholderTextColor="gray"
          style={styles.input}
          onPress={() => setNickname("")}
          placeholder="PUBG 닉네임을 입력하세요. (대소문자 구분)"
          value={ign}
          onChangeText={setNickname}
        />
        <TouchableOpacity style={styles.searchBTN} onPress={handleSearch}>
          <Text style={styles.searchText}>전적 검색하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 50,
    alignItems: "center",
  },
  container: {
    flex: 1,

    width: width,
    backgroundColor: "black",
  },
  platformTitle: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: "bold",
    fontFamily: "Pretendard-Bold",
    color: "white",
  },
  platformContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  platformBTN: {
    margin: 5,
    backgroundColor: "rgba(241,249,88,1)",
    width: 150,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  platformTEXT: {
    color: "black",
    textAlign: "center",
  },
  ignTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "Pretendard-Bold",
    marginBottom: 10,
  },
  input: {
    textAlign: "center",
    width: 300,
    height: 40,
    borderColor: "rgb(241,249,88)",
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    color: "white",
    marginBottom: 10,
    fontFamily: "Pretendard-Bold",
  },
  searchBTN: {
    width: 300,
    backgroundColor: "rgb(241,249,88)",
    borderRadius: 5,
    alignItems: "center",
    padding: 10,
  },
  searchText: {
    textAlign: "center",
    color: "black",
    fontSize: 16,
  },
});

export default Profile;
