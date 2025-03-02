import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import initFirebase from "../firebase";
import { useFonts } from "expo-font";
import { collection, getDocs } from "firebase/firestore";
const { width, height } = Dimensions.get("window");
const { db } = initFirebase();
import { useNavigation } from "@react-navigation/native";
import strings from "../i18n";
import responsiveSize from "../utils/responsiveSize";

const { responsiveWidth, responsiveHeight, responsiveFontSize } =
  responsiveSize;
const Gpt = ({ route }) => {
  const navigation = useNavigation();
  const id = route.params.id;
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });
  const [gptdata, setgptData] = useState(null);
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournamentQuery = await getDocs(collection(db, "gptDetail"));
        if (tournamentQuery.empty) {
          console.log("토너먼트 일정이 없습니다");
        } else {
          let tourData = null;
          tournamentQuery.forEach((doc) => {
            if (Number(doc.id) == Number(id)) {
              tourData = doc.data();
            }
          });
          if (tourData) {
            setgptData(tourData);
          } else {
            console.log("해당 팀을 찾을 수 없습니다.");
          }

          navigation.setOptions({
            title: strings.teamInfo,
            headerStyle: {
              backgroundColor: "black", // 헤더 배경 색
            },
            headerTintColor: "rgb(241,249,88)",
          });
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);
  if (!gptdata) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{strings.loading}...</Text>
      </SafeAreaView>
    );
  }
  const chunkArray = (array, size) => {
    return array.reduce((result, item, index) => {
      if (index % size === 0) result.push([]);
      result[result.length - 1].push(item);
      return result;
    }, []);
  };

  const playerChunks = chunkArray(gptdata.players, 2);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#171717",
            paddingTop: responsiveHeight(10),
            width: width,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Image source={{ uri: gptdata.logoUrl }} style={styles.image} />
          <View>
            <View
              style={{
                flexDirection: "row",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(16),
                  fontFamily: "Pretendard-Regular",
                  marginRight: responsiveWidth(5),
                  color: "white",
                }}
              >
                {gptdata.regionType}
              </Text>
              <View
                style={{
                  backgroundColor: "black",
                  flexDirection: "row",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    padding: responsiveWidth(3),
                    borderColor: "rgba(241,249,88,0.5)",
                    borderWidth: responsiveWidth(1),
                    borderRightWidth: 0,
                  }}
                >
                  <Image
                    source={require("../../assets/images/thumb.png")}
                    style={{
                      width: width * 0.04,
                      height: width * 0.04,
                      margin: responsiveWidth(0.5),
                    }}
                  />
                </View>

                <Text
                  style={{
                    color: "rgb(241,249,88)",
                    fontFamily: "Pretendard-Bold",
                    color: "white",
                    fontSize: responsiveFontSize(15),
                    marginLeft: -1,
                    borderColor: "rgba(241,249,88,0.5)",
                    borderWidth: responsiveWidth(1),
                    padding: responsiveWidth(2),
                    paddingHorizontal: responsiveHeight(5),
                    textAlign: "center",
                  }}
                >
                  {gptdata.likeCount}
                </Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {gptdata.title}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: "rgb(41,41,41)" }}>
          <View
            style={{
              width: width * 0.3,
              backgroundColor: "rgb(241,249,88)",
              padding: responsiveWidth(10),
              paddingLeft: responsiveWidth(15),
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Pretendard-Bold",
                fontSize: responsiveFontSize(15),
              }}
            >
              {strings.teamInfo}
            </Text>
          </View>
        </View>
        <View style={{ padding: responsiveWidth(15) }}>
          <Text
            style={{
              color: "white",
              fontFamily: "Pretendard-Bold",
              fontSize: responsiveFontSize(20),
            }}
          >
            {strings.player}
          </Text>
          {gptdata.players.map((player, index) => (
            <View
              key={player.playerId || index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: responsiveHeight(2),
                borderBottomWidth: 1,
                borderBottomColor: "gray",
              }}
            >
              <Image
                source={{ uri: player.profileImageUrl }}
                style={{
                  width: width * 0.3,
                  height: undefined,
                  aspectRatio: 1 / 1,
                  borderRadius: responsiveWidth(10),
                  marginRight: responsiveWidth(5),
                }}
              />
              <View>
                <Text
                  style={{
                    fontSize: responsiveFontSize(20),
                    fontFamily: "Pretendard-Bold",
                    color: "white",
                  }}
                >
                  {player.nickname}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(14),
                    fontFamily: "Pretendard-Regular",
                    color: "gray",
                  }}
                >
                  {player.name}
                </Text>
                <Text
                  style={{
                    color: "rgb(241,249,88)",
                    fontSize: responsiveFontSize(14),
                    fontFamily: "Pretendard-Regular",
                  }}
                >
                  K/D: {player.kill || "N/A"} | Damage: {player.damage || "N/A"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  image: {
    width: width * 0.3,
    height: undefined,
    aspectRatio: 1 / 1,
    marginBottom: responsiveHeight(10),
    backgroundColor: "white",
    borderRadius: responsiveWidth(50),
    marginRight: responsiveWidth(10),
  }, // 이미지 크기
  title: {
    fontSize: responsiveFontSize(30),
    fontWeight: "bold",
    color: "white",
  },
});

export default Gpt;
