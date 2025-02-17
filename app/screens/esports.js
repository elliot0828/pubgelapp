import { React, useRef, useState, useEffect } from "react";
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
import initFirebase from "../firebase"; // 경로는 파일 구조에 맞게 수정
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useFonts } from "expo-font";
import { ScrollView } from "react-native-gesture-handler";
// import { SafeAreaView } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");
const { app, auth, db } = initFirebase();

const Esports = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });
  const GPTitems = [
    { title: "4am", img: require("../../assets/images/GPT/4AM.png") },
    { title: "17", img: require("../../assets/images/GPT/17.png") },
    { title: "ces", img: require("../../assets/images/GPT/CES.png") },
    { title: "day", img: require("../../assets/images/GPT/DAY.png") },
    { title: "faze", img: require("../../assets/images/GPT/FaZe.png") },
    { title: "gen", img: require("../../assets/images/GPT/GEN.png") },
    { title: "navi", img: require("../../assets/images/GPT/NAVI.png") },
    { title: "pero", img: require("../../assets/images/GPT/PeRo.png") },
    { title: "sq", img: require("../../assets/images/GPT/SQ.png") },
    { title: "twis", img: require("../../assets/images/GPT/TWIS.png") },
  ];
  const carouselRef = useRef(null);

  const [esportsdata, setesportsData] = useState([]);

  const [rankingdata, setrankingData] = useState([]);

  const [ytdata, setytData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 데이터 쿼리 실행
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
          console.log("이스포츠 데이터:", latestEsports); // 여기서 데이터를 확인해보세요
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
          console.log("이스포츠 데이터:", prankingData); // 여기서 데이터를 확인해보세요
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
          console.log("영상 데이터:", ytData); // 여기서 데이터를 확인해보세요
        }
      } catch (e) {
        console.error("Error getting documents: ", e);
      }
    };

    fetchData();
  }, []); // 빈 배열을 넣어 한 번만 실행되도록 함

  const getBackgroundColor = (rank) => {
    switch (rank) {
      case "#1":
        return "rgb(241,249,88)";
      case "#2":
        return "#ffffff"; // Silver
      case "#3":
        return "#ffffff"; // 기본 배경색은 흰색
      default:
        return "rgb(243,243,243)"; // 기본 배경색은 흰색
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
          style={{ marginTop: 10 }}
          loop
          width={width * 0.9}
          height={228}
          autoPlay={true}
          autoPlayInterval={3000} // 3초마다 자동 이동
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
              fontSize: 18,
              color: "rgb(241,249,88)",
            }}
          >
            GLOBAL PARTNER TEAMS
          </Text>
        </View>
        <View style={styles.tableContainer}>
          {[0, 1].map((rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {GPTitems.slice(rowIndex * 5, rowIndex * 5 + 5).map(
                (item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tableCell}
                    onPress={() =>
                      navigation.navigate("Gpt", {
                        title: item.title,
                        img: item.img,
                      })
                    }
                  >
                    <Image source={item.img} style={styles.cellImage} />
                  </TouchableOpacity>
                )
              )}
            </View>
          ))}
        </View>
        <View
          style={{
            marginTop: 15,
            borderTopColor: "rgb(241,249,88)",
            borderWidth: 3,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontFamily: "Pretendard-Bold",
              fontSize: 20,
              padding: 10,
              color: "rgb(241,249,88)",
            }}
          >
            파워랭킹
          </Text>
        </View>
        <View style={{ backgroundColor: "rgb(243,243,243)", padding: 15 }}>
          <View style={{ flexDirection: "row", marginBottom: 15 }}>
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
              marginTop: 15,
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
          height={200}
          autoPlay={true}
          autoPlayInterval={2000} // 3초마다 자동 이동
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
        style={styles.fixedButton} // ✅ 스타일 적용
      >
        <ImageBackground
          source={{
            uri: "https://v1.padlet.pics/3/image.webp?t=c_limit%2Cdpr_2%2Ch_215%2Cw_1027&url=https%3A%2F%2Fu1.padletusercontent.com%2Fuploads%2Fpadlet-uploads%2F1711091133%2F0dbdf64cd60d11810049d767f9e0a6ea%2Fpubg_deston_new_map_3_4.jpg%3Fexpiry_token%3D5WaHZRdGG3LkUVQGy3SZ-zdRtq89aJeottSBaF_Hii8EGDVBG-vnLc5ZfL_2GiKosWMOCkHArMcc8LorETHcZ0EQapAzf-1EUkH200RSJK6rnLR9uEkIRzaa1WbMw40_mOCjXQG4BBMy7fJqeeyvIohnKrt8ycetCZ50YhU7n0w_Kldzinwx-IMRRVFtq1RddQsmvFr2S-kMJOylt55NXK43jPSikcI_HFrBkG37Ikc%3Dr",
          }}
          style={styles.backgroundImage} // ✅ 새로운 스타일 추가
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.buttonText}>
              PUBG 플레이어스 투어에 참여하세요!{"    >>"}
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
    width: width,
  },
  scrollContainer: {
    padding: 15,
    paddingTop: 0,
    paddingBottom: 50,
  },
  slide: {
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
  image: {
    width: width * 0.9,
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 10,
  },
  newsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  fixedButton: {
    position: "absolute", // ✅ 화면에 고정
    bottom: 0, // ✅ 하단에 배치
    width: "100%", // ✅ 전체 너비 차지
    height: height * 0.07, // ✅ 버튼 높이 조정
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center", // ✅ 텍스트 중앙 정렬
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // ✅ 반투명 배경
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

  tableContainer: { marginTop: 5, padding: 5 },
  tableRow: { flexDirection: "row" },
  tableCell: {
    width: "20%",
    borderWidth: 1,
    borderColor: "#545454",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b1b1b",
    marginLeft: -1,
    marginTop: -1,
  },
  cellImage: {
    width: 50,
    height: 50,
    marginBottom: 5, // 이미지 크기 조절
  },
  cellText: { fontSize: 14, textAlign: "center", fontWeight: "bold" },

  itemContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    flexDirection: "row",
  },
  rankImageContainer: {
    flexDirection: "row",
    alignItems: "center", // 수평 정렬
    marginRight: 10,
    width: "25%",
  },
  teamImage: {
    width: undefined,
    height: 20,
    aspectRatio: 1 / 1,
    borderRadius: 25,
    marginRight: 10,
  },
  rankText: {
    fontSize: 16,
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
  },
  rankTypeT: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "50%",
    textAlign: "center",
  },
  rankTypeP: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "25%",
    textAlign: "center",
  },
  snscontainer: {
    flexDirection: "row", // 가로로 정렬
    justifyContent: "space-between", // 버튼 사이 간격을 동일하게
    paddingLeft: 90,
    paddingRight: 90,
  },
  button: {
    width: "45",
    alignItems: "center",

    padding: 5, // 버튼 안쪽 여백
  },
  snsimage: {
    width: 30, // 이미지 너비
    height: 30, // 이미지 높이
    resizeMode: "contain", // 이미지 비율 유지
  },
});
const hori = StyleSheet.create({
  textContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    padding: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 5,
  },
  newsTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  slide: {
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
});
export default Esports;
