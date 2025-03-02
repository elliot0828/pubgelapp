import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
const { width, height } = Dimensions.get("window");
import responsiveSize, {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "../utils/responsiveSize";

import initFirebase from "../firebase";
const { db } = initFirebase();
import { collection, getDocs } from "firebase/firestore";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import strings from "../i18n";
const TournamentDetail = ({ route }) => {
  const navigation = useNavigation();
  const tournamentId = route.params.data.tournamentId;
  const [tournamentData, setTournament] = useState(null);
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournamentQuery = await getDocs(collection(db, "tournament"));
        if (tournamentQuery.empty) {
          console.log("토너먼트 일정이 없습니다");
        } else {
          let tourData = null;
          tournamentQuery.forEach((doc) => {
            if (Number(doc.data().tournamentId) == Number(tournamentId)) {
              tourData = doc.data();
            }
          });
          if (tourData) {
            setTournament(tourData);
          } else {
            console.log("해당 토너먼트를 찾을 수 없습니다.");
          }

          navigation.setOptions({
            title: `${strings.tour_detail}`,
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

  if (!tournamentData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{strings.loading}...</Text>
      </SafeAreaView>
    );
  }
  if (tournamentData.startAt && tournamentData.endAt) {
    tournamentData.startAt = tournamentData.startAt.slice(0, 10);
    tournamentData.endAt = tournamentData.endAt.slice(0, 10);
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {tournamentData !== null &&
          tournamentData.startAt !== null &&
          tournamentData.endAt !== null && (
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "#171717",
                  paddingVertical: responsiveHeight(10),
                  flexDirection: "row",
                  justifyContent: "center",
                  width: width,
                }}
              >
                <Image
                  source={{ uri: tournamentData.logoUrl }}
                  style={styles.image}
                />
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {tournamentData.shortTitle}
                </Text>
              </View>
              <View style={{ backgroundColor: "rgb(41,41,41)", width: width }}>
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
                    {strings.tour_info}
                  </Text>
                </View>
              </View>
              <View style={{ padding: responsiveWidth(10), width: width }}>
                <Text
                  style={{
                    color: "rgb(241,249,88)",
                    fontSize: responsiveFontSize(20),
                    fontFamily: "Pretendard-Bold",
                  }}
                >
                  {strings.tour_schedule}
                </Text>
                <Text
                  style={styles.descriptionLLL}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {tournamentData.startAt
                    ? tournamentData.startAt
                    : "정보 없음"}{" "}
                  ~ {tournamentData.endAt ? tournamentData.endAt : "정보 없음"}
                </Text>
                <Text
                  style={{
                    marginTop: responsiveHeight(10),
                    color: "rgb(241,249,88)",
                    fontSize: responsiveFontSize(20),
                    fontFamily: "Pretendard-Bold",
                  }}
                >
                  {strings.tour_prize}
                </Text>
                <Text
                  style={styles.description}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {tournamentData.prize ? tournamentData.prize : "정보 없음"}
                </Text>
                <Text
                  style={{
                    marginTop: responsiveHeight(10),
                    color: "rgb(241,249,88)",
                    fontSize: responsiveFontSize(20),
                    fontFamily: "Pretendard-Bold",
                  }}
                >
                  {strings.tour_region}
                </Text>
                <Text style={styles.description}>
                  {tournamentData.regionType
                    ? tournamentData.regionType
                    : "정보 없음"}
                </Text>
                <Text
                  style={{
                    marginTop: responsiveHeight(10),
                    color: "rgb(241,249,88)",
                    fontSize: responsiveFontSize(20),
                    fontFamily: "Pretendard-Bold",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {strings.tour_place}
                </Text>
                <Text style={styles.descriptionL}>
                  {tournamentData.place ? tournamentData.place : "정보 없음"}
                </Text>
              </View>
            </View>
          )}
        {tournamentData !== null && tournamentData.winnerTeamId !== null && (
          <View
            style={{
              alignItems: "center",
              marginTop: 10,
              paddingHorizontal: responsiveWidth(15),
            }}
          >
            <Text style={styles.titleW} numberOfLines={1}>
              WINNER
            </Text>
            <Image
              style={{
                width: "100%",
                height: undefined,
                aspectRatio: 16 / 9,
              }}
              source={{ uri: tournamentData.winnerTeamMobileImageUrl }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center", // 세로 중앙 정렬
                justifyContent: "center", // 가로 중앙 정렬
                marginBottom: responsiveHeight(15),
                width: "100%",
                backgroundColor: "rgba(243,243,243,1)",
              }}
            >
              <Image
                style={{
                  width: width * 0.15,
                  height: undefined,
                  aspectRatio: 1 / 1,
                  marginTop: responsiveHeight(0),
                }}
                source={{ uri: tournamentData.winnerTeamLogoUrl }}
              />
              <Text style={styles.descriptionLL}>
                {tournamentData.winnerTeamDisplayName}
              </Text>
            </View>
          </View>
        )}
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
    width: width * 0.2,
    height: undefined,
    aspectRatio: 1 / 1,
    marginRight: responsiveWidth(5),
  }, // 이미지 크기
  title: {
    marginTop: responsiveWidth(5),
    fontSize: responsiveFontSize(30),
    fontWeight: "bold",

    fontFamily: "WinnerSans-CompBold",

    paddingBottom: responsiveWidth(10),
    color: "white",
  },
  description: {
    marginTop: responsiveHeight(5),
    color: "white",
    fontFamily: "WinnerSans-CompBold",
    width: width,
    fontSize: responsiveFontSize(30),
  },
  descriptionL: {
    marginTop: responsiveHeight(5),
    fontFamily: "WinnerSans-CompBold",
    color: "white",
    width: width,
    fontSize: responsiveFontSize(30),
    paddingBottom: responsiveHeight(15),
  },
  descriptionLL: {
    fontFamily: "WinnerSans-CompBold",
    alignContent: "center",
    justifyContent: "center",
    color: "black",
    textAlign: "center",
    fontSize: responsiveFontSize(25),
  },
  descriptionLLL: {
    width: width * 0.9,
    fontFamily: "WinnerSans-CompBold",
    color: "white",
    fontSize: responsiveFontSize(30),
    marginTop: responsiveHeight(5),
  },
  titleW: {
    fontSize: responsiveFontSize(35),
    backgroundColor: "rgb(241,249,88)",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "WinnerSans-CompBold",
    paddingVertical: responsiveWidth(10),
    width: "100%",
  },
});

export default TournamentDetail;
