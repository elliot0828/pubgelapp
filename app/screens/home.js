import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import initFirebase from "../firebase"; // 경로는 파일 구조에 맞게 수정
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import Carousel from "react-native-reanimated-carousel";
import { useFonts } from "expo-font";
import { ScrollView } from "react-native-gesture-handler";
const { app, auth, db } = initFirebase();
const { width, height } = Dimensions.get("window");
const Home = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });
  const [patchdata, setpatchData] = useState([]);
  const [announcementdata, setannounceData] = useState([]);
  const [devdata, setdevData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 데이터 쿼리 실행
        const patchQuery = await getDocs(collection(db, "patchNote"));
        if (patchQuery.empty) {
          console.log("패치노트 데이터가 없습니다.");
        } else {
          const patchNoteData = [];
          patchQuery.forEach((doc) => {
            patchNoteData.push({ id: doc.id, ...doc.data() });
          });
          const latestPatchNote = patchNoteData.slice(-3);
          setpatchData(latestPatchNote);
          //console.log("패치노트 데이터:", latestPatchNote); // 여기서 데이터를 확인해보세요
        }

        const announceQuery = await getDocs(collection(db, "announcement"));
        if (announceQuery.empty) {
          console.log("공지 데이터가 없습니다.");
        } else {
          const announceData = [];
          announceQuery.forEach((doc) => {
            announceData.push({ id: doc.id, ...doc.data() });
          });
          const latestAnnounce = announceData.slice(-5);
          setannounceData(latestAnnounce);
          // console.log("패치노트 데이터:", latestAnnounce); // 여기서 데이터를 확인해보세요
        }

        const devQuery = await getDocs(collection(db, "devLetter"));
        if (devQuery.empty) {
          console.log("공지 데이터가 없습니다.");
        } else {
          const devData = [];
          devQuery.forEach((doc) => {
            devData.push({ id: doc.id, ...doc.data() });
          });
          const latestDev = devData.slice(0, 5);
          setdevData(latestDev);
          // console.log("패치노트 데이터:", latestDev); // 여기서 데이터를 확인해보세요
        }
      } catch (e) {
        console.error("Error getting documents: ", e);
      }
    };

    fetchData();
  }, []); // 빈 배열을 넣어 한 번만 실행되도록 함

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <Text
            style={{
              color: "#FFA200",
              // marginTop: 10,
              fontSize: 25,
              fontFamily: "BrigendsExpanded",
              textAlign: "center",
            }}
          >
            PUBG UPDATES
          </Text>
        </View>
        {patchdata.length > 0 ? (
          <Carousel
            style={{ marginTop: 10 }}
            loop
            width={width * 1}
            height={220}
            autoPlay={true}
            autoPlayInterval={3000} // 3초마다 자동 이동
            data={patchdata}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                <View style={patch.slide}>
                  <Image source={{ uri: item.image }} style={patch.image} />
                  <Text
                    style={patch.newsTitle}
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
        ) : (
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontFamily: "Pretendard-Regular",
            }}
          >
            데이터를 불러오는 중...
          </Text>
        )}
        <View>
          <Text
            style={{
              color: "#FFA200",
              fontSize: 23,
              fontFamily: "BrigendsExpanded",
              textAlign: "center",
            }}
          >
            PUBG NEWS
          </Text>
        </View>
        {announcementdata.length > 0 ? (
          <Carousel
            style={{ marginTop: 10, marginBottom: 0 }}
            loop
            width={width * 1}
            height={200}
            autoPlay={true}
            autoPlayInterval={3000} // 3초마다 자동 이동
            data={announcementdata}
            mode={"horizontal-stack"}
            modeConfig={{
              snapDirection: "left",
              stackInterval: 18,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
                <View style={hori.slide}>
                  <Image source={{ uri: item.image }} style={patch.image} />
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
        ) : (
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontFamily: "Pretendard-Regular",
            }}
          >
            데이터를 불러오는 중...
          </Text>
        )}
        <View>
          <Text
            style={{
              color: "#FFA200",
              fontSize: 23,
              fontFamily: "BrigendsExpanded",
              textAlign: "center",
            }}
          >
            DEV LETTEr
          </Text>
        </View>
        {devdata.length > 0 ? (
          <View style={{ alignItems: "center" }}>
            {devdata.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.anContainer}
                onPress={() => Linking.openURL(item.link)}
              >
                {item.image && (
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={styles.anImage}
                  />
                )}
                <Text
                  numberOfLines={1} // 한 줄로 제한
                  ellipsizeMode="tail"
                  style={styles.anTitle}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text
            style={{
              color: "white",
              fontSize: 20,
              fontFamily: "Pretendard-Regular",
            }}
          >
            데이터를 불러오는 중...
          </Text>
        )}
        <View>
          <Text
            style={{
              color: "#FFA200",
              fontSize: 23,
              marginTop: 5,
              marginBottom: 5,
              fontFamily: "BrigendsExpanded",
              textAlign: "center",
            }}
          >
            PUBG SHOP
          </Text>
        </View>
        <View style={sns.container}>
          <TouchableOpacity
            style={sns.button}
            onPress={() =>
              Linking.openURL("https://displate.com/licensed/pubg")
            }
          >
            <Image
              source={{
                uri: "https://wstatic-prod.pubg.com/web/live/static/merch/images/img-superplay.jpg",
              }}
              style={sns.icon}
            />
            <Text style={sns.buttonText}>슈퍼플레이</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={sns.button}
            onPress={() =>
              Linking.openURL("https://displate.com/licensed/pubg")
            }
          >
            <Image
              source={{
                uri: "https://wstatic-prod.pubg.com/web/live/static/merch/images/img-displate.jpg",
              }}
              style={sns.icon}
            />
            <Text style={sns.buttonText}>Displate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={sns.button}
            onPress={() =>
              Linking.openURL("https://displate.com/licensed/pubg")
            }
          >
            <Image
              source={{
                uri: "https://wstatic-prod.pubg.com/web/live/static/merch/images/img-youtooz.jpg",
              }}
              style={sns.icon}
            />
            <Text style={sns.buttonText}>Youtooz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={sns.button}
            onPress={() =>
              Linking.openURL("https://displate.com/licensed/pubg")
            }
          >
            <Image
              source={{
                uri: "https://wstatic-prod.pubg.com/web/live/static/merch/images/img-drkn.jpg",
              }}
              style={sns.icon}
            />
            <Text style={sns.buttonText}>DRKN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={sns.button}
            onPress={() =>
              Linking.openURL("https://displate.com/licensed/pubg")
            }
          >
            <Image
              source={{
                uri: "https://wstatic-prod.pubg.com/web/live/static/merch/images/img-razer.jpg",
              }}
              style={sns.icon}
            />
            <Text style={sns.buttonText}>RAZER</Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={{
              color: "#FFA200",
              fontSize: 20,
              marginTop: 10,
              marginBottom: 5,
              fontFamily: "BrigendsExpanded",
              textAlign: "center",
            }}
          >
            COMMUNITY LINKS
          </Text>
          <View style={styles.cmcontainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL("https://www.facebook.com/PUBGBATTLEGROUNDSKR")
              }
            >
              <Image
                source={require("../../assets/images/sns/facebook.png")}
                style={styles.cmimage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  "https://www.youtube.com/channel/UCms8Ge7H1ZGgw6nV94fUhUQ"
                )
              }
            >
              <Image
                source={require("../../assets/images/sns/youtube.png")}
                style={styles.cmimage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  "https://www.instagram.com/pubg_battlegrounds_kr/"
                )
              }
            >
              <Image
                source={require("../../assets/images/sns/instagram.png")}
                style={styles.cmimage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL("https://discord.com/invite/pubgkorea")
              }
            >
              <Image
                source={require("../../assets/images/sns/discord.png")}
                style={styles.cmimage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL("https://cafe.naver.com/playbattlegrounds")
              }
            >
              <Image
                source={require("../../assets/images/sns/naver.png")}
                style={styles.cmimage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL("https://www.tiktok.com/@pubg.kr.official")
              }
            >
              <Image
                source={require("../../assets/images/sns/tiktok.png")}
                style={styles.cmimage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cmcontainer: {
    flexDirection: "row", // 가로로 정렬
    justifyContent: "space-between", // 버튼 사이 간격을 동일하게
    paddingLeft: 20,
    paddingRight: 20,
  },
  button: {
    width: "45",
    alignItems: "center",

    padding: 5, // 버튼 안쪽 여백
  },
  cmimage: {
    width: 30, // 이미지 너비
    height: 30, // 이미지 높이
    resizeMode: "contain", // 이미지 비율 유지
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
    padding: 15,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  patchNoteContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "white",
    width: "100%",
    alignItems: "center",
  },

  anContainer: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "95%",
    alignItems: "center",
  },
  patchNoteTitle: {
    fontSize: 18,

    fontFamily: "Pretendard-Regular",
  },
  patchNoteImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    marginBottom: 10,
  },
  anImage: {
    width: undefined,
    height: "50",
    aspectRatio: 16 / 9,
    borderRadius: 8,
  },
  anTitle: {
    color: "white",
    width: "70%",
    paddingLeft: 10,
    fontSize: 15,
    fontFamily: "Pretendard-Bold",
  },
});
const patch = StyleSheet.create({
  slide: {
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    // marginLeft: 5,
    // marginRight: 5,
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
});
const hori = StyleSheet.create({
  textContainer: {
    position: "absolute",
    bottom: 5,
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
    textAlign: "center",
  },
  slide: {
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
});
const sns = StyleSheet.create({
  container: {
    flexDirection: "row", // row 방향으로 배치
    justifyContent: "space-between", // 버튼들 간에 여백을 두고 배치
    alignItems: "center", // 세로 중앙 정렬
  },
  button: {
    width: "18%",
    borderRadius: 8,
    margin: 2,
    padding: 4,
    alignItems: "center", // 이미지와 텍스트를 수직 중앙에 배치
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginTop: 3,
    marginBottom: 5, // 이미지와 텍스트 사이 간격
  },
  buttonText: {
    marginBottom: 3,
    fontSize: 12,
    color: "white",
    fontFamily: "Pretendard-Bold",
  },
});
export default Home;
