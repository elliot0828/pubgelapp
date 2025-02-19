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
import initFirebase from "../firebase";
const { app, auth, db } = initFirebase();
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
const TournamentDetail = ({ route }) => {
  const navigation = useNavigation(); // 네비게이션 훅 사용
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
            title: "토너먼트 상세보기",
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
        <Text style={styles.title}>로딩 중...</Text>
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
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <Image
                source={{ uri: tournamentData.logoUrl }}
                style={styles.image}
              />
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {tournamentData.shortTitle}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  color: "rgb(241,249,88)",
                  fontSize: 18,
                  fontFamily: "Pretendard-Bold",
                  width: width * 0.8,
                }}
              >
                일정
              </Text>
              <Text
                style={styles.description}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tournamentData.startAt ? tournamentData.startAt : "정보 없음"}{" "}
                ~ {tournamentData.endAt ? tournamentData.endAt : "정보 없음"}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  color: "rgb(241,249,88)",
                  fontSize: 18,
                  fontFamily: "Pretendard-Bold",
                  width: width * 0.8,
                }}
              >
                상금
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
                  marginTop: 10,
                  color: "rgb(241,249,88)",
                  fontSize: 18,
                  fontFamily: "Pretendard-Bold",
                  width: width * 0.8,
                }}
              >
                참가지역
              </Text>
              <Text style={styles.description}>
                {tournamentData.regionType
                  ? tournamentData.regionType
                  : "정보 없음"}
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  color: "rgb(241,249,88)",
                  fontSize: 18,
                  fontFamily: "Pretendard-Bold",
                  width: width * 0.8,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                장소
              </Text>
              <Text style={styles.descriptionL}>
                {tournamentData.place ? tournamentData.place : "정보 없음"}
              </Text>
            </View>
          )}
        {tournamentData !== null && tournamentData.winnerTeamId !== null && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={styles.title} numberOfLines={1}>
              WINNER
            </Text>
            <Image
              style={{
                width: width * 0.8,
                height: undefined,
                aspectRatio: 16 / 9,
                marginTop: 10,
              }}
              source={{ uri: tournamentData.winnerTeamMobileImageUrl }}
            />
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center", // 세로 중앙 정렬
                justifyContent: "center", // 가로 중앙 정렬
                marginBottom: 15,
              }}
            >
              <Image
                style={{
                  width: width * 0.15,
                  height: undefined,
                  aspectRatio: 16 / 9,
                  marginTop: 10,
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
    padding: 15,
    backgroundColor: "black",
  },
  image: { width: width * 0.25, height: undefined, aspectRatio: 1 / 1 }, // 이미지 크기
  title: {
    marginTop: 5,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "WinnerSans-CompBold",
    borderBottomColor: "rgb(241,249,88)",
    borderBottomWidth: 2,
    width: width * 0.8,
    paddingBottom: 15,
    color: "white",
  },
  description: {
    marginTop: 5,
    color: "white",
    fontFamily: "WinnerSans-CompBold",
    width: width * 0.8,
    fontSize: 14,
  },
  descriptionL: {
    marginTop: 5,
    fontFamily: "WinnerSans-CompBold",
    color: "white",
    width: width * 0.8,
    fontSize: 14,
    borderBottomColor: "rgb(241,249,88)",
    borderBottomWidth: 2,
    paddingBottom: 15,
  },
  descriptionLL: {
    fontFamily: "WinnerSans-CompBold",
    color: "white",
    fontSize: 14,
  },
});

export default TournamentDetail;
