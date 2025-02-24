import { React, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Image,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Linking } from "react-native";

import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useFonts } from "expo-font";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
import initFirebase from "../firebase";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "../utils/responsiveSize";
const { db } = initFirebase();

const Esports = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });

  const [esportsdata, setesportsData] = useState([]);

  const [rankingdata, setrankingData] = useState([]);
  const [gptdata, setgptData] = useState([]);
  const [ytdata, setytData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const esportsQuery = await getDocs(collection(db, "esportsNews"));
        if (esportsQuery.empty) {
          console.log("이스포츠 데이터가 없습니다.");
        } else {
          const esportsData = [];
          esportsQuery.forEach((doc) => {
            esportsData.push({ id: doc.id, ...doc.data() });
          });
          const latestEsports = esportsData.slice(-5);
          setesportsData(latestEsports);
        }

        const rankingQuery = await getDocs(
          query(collection(db, "powerRanking"), orderBy("powerPoint", "desc"))
        );

        if (rankingQuery.empty) {
          console.log("파워랭킹 데이터가 없습니다.");
        } else {
          const prankingData = [];
          rankingQuery.forEach((doc) => {
            prankingData.push({ id: doc.id, ...doc.data() });
          });
          setrankingData(prankingData);
        }

        const gptQuery = await getDocs(collection(db, "gpt"));

        if (gptQuery.empty) {
          console.log("파워랭킹 데이터가 없습니다.");
        } else {
          const gptData = [];
          gptQuery.forEach((doc) => {
            gptData.push({ id: doc.id, ...doc.data() });
          });
          setgptData(gptData);
        }

        const ytQuery = await getDocs(
          query(
            collection(db, "esportsVideo"),
            orderBy("publishedAt", "desc"),
            limit(5)
          )
        );

        if (ytQuery.empty) {
          console.log("영상 데이터가 없습니다.");
        } else {
          const ytData = [];
          ytQuery.forEach((doc) => {
            ytData.push({ id: doc.id, ...doc.data() });
          });
          setytData(ytData);
        }
      } catch (e) {
        console.error("Error getting documents: ", e);
      }
    };

    fetchData();
  }, []);

  const getBackgroundColor = (rank) => {
    switch (rank) {
      case "#1":
        return "rgb(241,249,88)";
      case "#2":
        return "#ffffff";
      case "#3":
        return "#ffffff";
      default:
        return "rgb(243,243,243)";
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
              fontSize: 20,
              color: "rgb(241,249,88)",
            }}
          >
            PUBG Esports NEWS
          </Text>
        </View>
        <Carousel
          style={{ marginTop: responsiveHeight(10) }}
          loop
          width={width * 0.9}
          height={width * 0.6}
          autoPlay={true}
          autoPlayInterval={3000}
          data={esportsdata}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
              <View style={styles.slide}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text
                  style={styles.newsTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          scrollAnimationDuration={1000}
        />
        <View>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontFamily: "BrigendsExpanded",
              fontSize: responsiveFontSize(18),
              color: "rgb(241,249,88)",
            }}
          >
            GLOBAL PARTNER TEAMS
          </Text>
        </View>
        <View style={styles.tableContainer}>
          {[0, 1].map((rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {gptdata
                .slice(rowIndex * 5, rowIndex * 5 + 5)
                .map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tableCell}
                    onPress={() =>
                      navigation.navigate("Gpt", {
                        id: item.teamId,
                      })
                    }
                  >
                    <Image
                      source={{ uri: item.logoUrl }}
                      style={styles.cellImage}
                    />
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </View>
        <View
          style={{
            marginTop: responsiveHeight(8),
            borderTopColor: "rgb(241,249,88)",
            borderWidth: responsiveWidth(3),
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontFamily: "Pretendard-Bold",
              fontSize: responsiveFontSize(20),
              padding: responsiveWidth(10),
              color: "rgb(241,249,88)",
              width: width * 0.9,
            }}
          >
            파워랭킹
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "rgb(243,243,243)",
            padding: responsiveWidth(15),
            marginHorizontal: responsiveWidth(15),
          }}
        >
          <View
            style={{ flexDirection: "row", marginBottom: responsiveHeight(15) }}
          >
            <Text style={styles.rankTypeR}>RANK</Text>
            <Text style={styles.rankTypeT}>TEAM</Text>
            <Text style={styles.rankTypeP}>POWER PT</Text>
          </View>
          {rankingdata.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemContainer,
                { backgroundColor: getBackgroundColor(item.rank) },
              ]}
            >
              <View style={styles.textContainer}>
                <View style={styles.rankImageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.teamImage}
                  />
                  <Text style={styles.rankText}>{item.rank}</Text>
                </View>
                <Text
                  style={styles.teamText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.team}
                </Text>
                <Text style={styles.pointsText}>{item.powerPoint}</Text>
              </View>
            </View>
          ))}
        </View>
        <View>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontFamily: "Pretendard-Bold",
              marginTop: responsiveHeight(15),
              fontSize: 25,
              color: "rgb(241,249,88)",
            }}
          >
            미디어
          </Text>
        </View>
        <Carousel
          style={{ marginTop: 10, marginBottom: 0 }}
          loop
          width={width * 0.9}
          height={width * 0.54}
          autoPlay={true}
          autoPlayInterval={2000}
          data={ytdata}
          mode={"horizontal-stack"}
          modeConfig={{
            snapDirection: "left",
            stackInterval: 18,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => Linking.openURL(item.videoUrl)}>
              <View style={hori.slide}>
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.image}
                />
                <View style={hori.textContainer}>
                  <Text
                    style={hori.newsTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          scrollAnimationDuration={1000}
        />
        <View style={styles.snscontainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/channel/UCAl4HWznMn7KhKBRFO5eiFA"
              )
            }
          >
            <Image
              source={require("../../assets/images/sns/youtube.png")}
              style={styles.snsimage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Linking.openURL("https://www.instagram.com/pubgesports_kr")
            }
          >
            <Image
              source={require("../../assets/images/sns/instagram.png")}
              style={styles.snsimage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL("https://x.com/PUBGEsports_KR")}
          >
            <Image
              source={require("../../assets/images/sns/twitter.png")}
              style={styles.snsimage}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => Linking.openURL("https://www.pubgplayerstour.kr/")}
        style={styles.fixedButton}
      >
        <ImageBackground
          source={{
            uri: "https://v1.padlet.pics/3/image.webp?t=c_limit%2Cdpr_2%2Ch_215%2Cw_1027&url=https%3A%2F%2Fu1.padletusercontent.com%2Fuploads%2Fpadlet-uploads%2F1711091133%2F0dbdf64cd60d11810049d767f9e0a6ea%2Fpubg_deston_new_map_3_4.jpg%3Fexpiry_token%3D5WaHZRdGG3LkUVQGy3SZ-zdRtq89aJeottSBaF_Hii8EGDVBG-vnLc5ZfL_2GiKosWMOCkHArMcc8LorETHcZ0EQapAzf-1EUkH200RSJK6rnLR9uEkIRzaa1WbMw40_mOCjXQG4BBMy7fJqeeyvIohnKrt8ycetCZ50YhU7n0w_Kldzinwx-IMRRVFtq1RddQsmvFr2S-kMJOylt55NXK43jPSikcI_HFrBkG37Ikc%3Dr",
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.buttonText}>
              PUBG 플레이어스 투어에 참여하세요!
            </Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: responsiveHeight(50),
  },
  slide: {
    borderRadius: responsiveWidth(10),
    overflow: "hidden",
    alignItems: "center",
  },
  image: {
    width: width * 0.9,
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: responsiveWidth(10),
  },
  newsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: responsiveHeight(8),
  },
  fixedButton: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.058,
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  tableContainer: {
    marginTop: responsiveHeight(5),
    padding: responsiveWidth(10),
    paddingTop: responsiveHeight(5),
    alignItems: "center",
  },
  tableRow: { flexDirection: "row" },
  tableCell: {
    width: "20%",
    borderWidth: responsiveWidth(1),
    borderColor: "#545454",
    borderWidth: responsiveWidth(1),
    backgroundColor: "#171717",
    padding: responsiveWidth(5),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -1,
    marginTop: -1,
  },
  cellImage: {
    width: responsiveWidth(50),
    height: responsiveWidth(50),
  },

  itemContainer: {
    flexDirection: "row",
    padding: responsiveWidth(10),
    borderBottomWidth: responsiveWidth(1),
    borderBottomColor: "#ddd",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    flexDirection: "row",
  },
  rankImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: responsiveWidth(10),
    width: "25%",
  },
  teamImage: {
    width: undefined,
    height: responsiveHeight(18),
    aspectRatio: 1 / 1,
    borderRadius: responsiveWidth(25),
    marginRight: responsiveWidth(10),
  },
  rankText: {
    fontSize: responsiveFontSize(18),
    fontWeight: "bold",
    textAlign: "center",
  },
  teamText: {
    width: "50%",
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  pointsText: {
    width: "25%",
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  rankTypeR: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "25%",
    textAlign: "center",
    fontSize: responsiveFontSize(15),
  },
  rankTypeT: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "50%",
    textAlign: "center",
    fontSize: responsiveFontSize(15),
  },
  rankTypeP: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "25%",
    textAlign: "center",
    fontSize: responsiveFontSize(15),
  },
  snscontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(90),
  },
  button: {
    width: "45",
    alignItems: "center",

    padding: responsiveWidth(5),
  },
  snsimage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});
const hori = StyleSheet.create({
  textContainer: {
    position: "absolute",
    bottom: responsiveHeight(10),
    left: responsiveWidth(10),
    right: responsiveWidth(10),
    padding: responsiveWidth(5),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: responsiveWidth(5),
  },
  newsTitle: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  slide: {
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
});
export default Esports;
