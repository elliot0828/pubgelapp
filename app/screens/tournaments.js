import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Linking,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import responsiveSize from "../utils/responsiveSize";
import messaging from "@react-native-firebase/messaging";
const { responsiveWidth, responsiveHeight, responsiveFontSize } =
  responsiveSize;
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { collection, getDocs } from "firebase/firestore";

import moment from "moment";
import { useFonts } from "expo-font";
import TournamentContext from "../tournamentContext";
const { width, height } = Dimensions.get("window");

const Tournaments = () => {
  const { tournamentsData, loading } = useContext(TournamentContext);

  const navigation = useNavigation(); // 네비게이션 훅 사용
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });

  const [markedDates, setMarkedDates] = useState({});

  const [tournamentData, setTournaments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const topic = "tournament"; // 토픽명

  const checkSubscription = async () => {
    const authStatus = await messaging().hasPermission();
    if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      setIsEnabled(true); // 알림 허용된 경우 기본값 true
    }
  };
  useEffect(() => {
    const newMarkedDates = {};
    tournamentsData.forEach((doc) => {
      newMarkedDates[doc.matchDate] = {
        marked: true,
        dotColor: "rgb(241,249,88)",
      };
    });
    setMarkedDates({
      ...newMarkedDates,
      [selectedDate]: {
        ...newMarkedDates[selectedDate], // 기존 데이터 유지
        selected: true,
        selectedColor: "rgba(241,249,88,1)",
        selectedTextColor: "black",
      },
    });

    // 오늘 날짜 기준으로 초기 데이터 설정
    setSelectedTournaments(
      tournamentsData.filter((t) => t.matchDate === selectedDate)
    );
  }, tournamentsData);

  const handleDayPress = (day) => {
    const newSelectedDate = day.dateString;

    // 선택된 날짜의 토너먼트 데이터 필터링
    const filteredTournaments = tournamentsData.filter(
      (tournament) => tournament.matchDate === newSelectedDate
    );
    setSelectedTournaments(filteredTournaments);
    setSelectedDate(newSelectedDate);

    // 기존 markedDates 유지 + 새 선택된 날짜 강조
    setMarkedDates((prevMarkedDates) => {
      const updatedMarkedDates = { ...prevMarkedDates };

      // 기존 selected 제거
      Object.keys(updatedMarkedDates).forEach((date) => {
        if (updatedMarkedDates[date].selected) {
          delete updatedMarkedDates[date].selected;
          delete updatedMarkedDates[date].selectedColor;
          delete updatedMarkedDates[date].selectedTextColor;
        }
      });

      // 새로운 selectedDate 반영
      updatedMarkedDates[newSelectedDate] = {
        ...updatedMarkedDates[newSelectedDate], // 기존 dotColor 유지
        selected: true,
        selectedColor: "rgba(241,249,88,1)",
        selectedTextColor: "black",
      };

      return updatedMarkedDates;
    });
  };
  if (loading) {
    return <Text>Loading...</Text>;
  }

  const renderTournamentItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("TournamentDetail", {
          id: item.id,
          data: item,
        })
      }
      style={styles.tournamentItem}
    >
      {item.liveOutLink !== null ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Image
            source={{ uri: item.tournamentLogoUrl }}
            style={{
              width: width * 0.1,
              height: undefined,
              aspectRatio: 1 / 1,
              marginRight: responsiveWidth(10),
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={styles.tournamentTitle2}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.shortTitle} {item.title}
            </Text>
            <Text
              style={styles.tournamentDate}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {moment(item.startAt).format("HH:mm")} -{" "}
              {moment(item.liveEndAt).format("HH:mm")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL(item.liveOutLink)}
            style={{
              backgroundColor: "rgba(241,249,88,0.9)",
              borderRadius: responsiveWidth(5),
              marginLeft: responsiveWidth(10),
              paddingVertical: responsiveHeight(8),
              paddingHorizontal: responsiveWidth(12),
              // marginTop: 10,
              maxWidth: responsiveWidth(120), // 버튼의 최대 너비를 제한
              justifySelf: "flex-start", // 버튼이 다른 내용과 잘 정렬되도록
              justifyContent: "center", // 세로 가운데 정렬
              alignItems: "center", // 세로 가운데 정렬
            }}
          >
            <Text
              style={{
                color: "black",
                fontFamily: "Pretendard-Bold",
              }}
            >
              보러가기
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Image
            source={{ uri: item.tournamentLogoUrl }}
            style={{
              width: width * 0.1,
              height: undefined,
              aspectRatio: 1 / 1,
              marginRight: 10,
            }}
          />
          <View>
            <Text
              style={styles.tournamentTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.shortTitle} {item.title}
            </Text>
            <Text
              style={styles.tournamentDate}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {moment(item.startAt).format("HH:mm")} -{" "}
              {moment(item.liveEndAt).format("HH:mm")}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
  const toggleSwitch = async () => {
    if (isEnabled) {
      messaging().unsubscribeFromTopic(topic);
      console.log("토너먼트 알림 해제됨");
    } else {
      messaging().subscribeToTopic(topic);
      console.log("토너먼트 알림 구독됨");
    }
    setIsEnabled(!isEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text
          style={{
            textAlign: "center",
            color: "white",
            fontFamily: "BrigendsExpanded",
            fontSize: responsiveFontSize(20),
            color: "rgb(241,249,88)",
          }}
        >
          Tournament{"\n"}Calendar
        </Text>
      </View>
      <View>
        <View>
          <Calendar
            current={new Date().toISOString().split("T")[0]}
            hideExtraDays={true}
            markedDates={markedDates} // ✅ 일정 있는 날짜 + 선택된 날짜 반영
            onDayPress={handleDayPress}
            theme={{
              calendarBackground: "black",
              monthTextColor: "white",
              dayTextColor: "white",
              textSectionTitleColor: "rgb(241,249,88)",
              todayTextColor: "rgb(241,249,88)",
              arrowColor: "rgb(241,249,88)",
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Pretendard-Regular",
              fontSize: responsiveFontSize(15),
              alignItems: "center",
              alignContent: "center",
              marginRight: responsiveWidth(5),
            }}
          >
            토너먼트 알림 받기
          </Text>
          <Switch
            trackColor={{ false: "#171717", true: "#171717" }}
            thumbColor={isEnabled ? "rgb(241,249,88)" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={styles.scheduleContainer}>
          {selectedTournaments.length > 0 ? (
            <FlatList
              data={selectedTournaments}
              renderItem={renderTournamentItem}
              keyExtractor={(item) => item.matchScheduleId}
              style={{
                paddingBottom: responsiveHeight(30),
                height: width,
              }}
              contentContainerStyle={{ paddingBottom: responsiveHeight(50) }}
            />
          ) : (
            <Text style={styles.noScheduleText}>
              선택한 날짜에 일정이 없습니다.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: responsiveHeight(50),
    paddingHorizontal: responsiveWidth(20),
  },
  scheduleContainer: {
    marginTop: responsiveHeight(5),
    paddingTop: responsiveHeight(5),

    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(5),
  },
  tournamentItem: {
    paddingVertical: responsiveHeight(10),
    paddingHorizontal: responsiveWidth(15),
    backgroundColor: "#1A1A1A",
    borderRadius: responsiveWidth(10),
    marginBottom: responsiveHeight(15),
    borderTopColor: "rgb(241,249,88)",
    borderTopWidth: responsiveHeight(2),
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap", // 텍스트와 버튼이 겹치지 않게 함
  },
  tournamentTitle: {
    fontFamily: "Pretendard-Bold",
    color: "white",
    fontSize: responsiveFontSize(16),
    maxWidth: responsiveWidth(250),
  },
  tournamentTitle2: {
    fontFamily: "Pretendard-Bold",
    color: "white",
    fontSize: responsiveFontSize(16),
    flexShrink: 1,
  },
  tournamentDate: {
    fontFamily: "Pretendard-Regular",
    color: "#B4B4B4",
    fontSize: responsiveFontSize(14),
    flexShrink: 1,
  },
  noScheduleText: {
    fontSize: responsiveFontSize(16),
    color: "#777",
    textAlign: "center",
  },
});
export default Tournaments;
Tournaments.js;
