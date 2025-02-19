import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import initFirebase from "../firebase"; // 경로는 파일 구조에 맞게 수정
const { app, auth, db } = initFirebase();
import moment from "moment";
import { useFonts } from "expo-font";
import { ScrollView } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");
const Tournaments = () => {
  const navigation = useNavigation(); // 네비게이션 훅 사용
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });

  const [tournamentsData, setTournaments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTournaments, setSelectedTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const scheduleQuery = await getDocs(collection(db, "schedule"));
        if (scheduleQuery.empty) {
          console.log("토너먼트 일정이 없습니다");
        } else {
          const scheduleData = [];
          scheduleQuery.forEach((doc) => {
            let matchDate = doc.data().startAt;
            scheduleData.push({
              id: doc.data().matchScheduleId,
              matchDate: matchDate.slice(0, 10),
              ...doc.data(),
            });
          });

          setTournaments(scheduleData);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);

  const formatDateForCalendar = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const filteredTournaments = tournamentsData.filter(
      (tournament) =>
        formatDateForCalendar(tournament.matchDate) === day.dateString
    );

    setSelectedTournaments(filteredTournaments);
  };
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
      <Image
        source={{ uri: item.tournamentLogoUrl }}
        style={{ width: 50, height: 50, marginRight: 5 }}
      />

      {item.liveOutLink !== null ? (
        <View style={{ flexDirection: "row" }}>
          <View>
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
              borderRadius: 5,
              marginLeft: 5,
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}
          >
            <Text
              style={{
                color: "black",
                fontFamily: "Prentendard-Bold",
              }}
            >
              보러가기
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          Tournament Calendar
        </Text>
      </View>
      <View>
        <Calendar
          // 현재 날짜로 초기화
          current={new Date().toISOString().split("T")[0]}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "rgba(241,249,88,1)",
              selectedTextColor: "black",
            },
          }} // 선택된 날짜 표시
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

        <View style={styles.scheduleContainer}>
          {selectedTournaments.length > 0 ? (
            <FlatList
              data={selectedTournaments}
              renderItem={renderTournamentItem}
              keyExtractor={(item) => item.matchScheduleId}
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scheduleContainer: {
    marginTop: 5,
    paddingTop: 10,
  },
  tournamentItem: {
    borderTopWidth: 3,
    borderColor: "rgb(241,249,88)",
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  tournamentTitle: {
    fontFamily: "Pretendard-Bold",
    color: "white",
    fontSize: 16,
  },
  tournamentTitle2: {
    width: 225,
    fontFamily: "Pretendard-Bold",
    color: "white",
    fontSize: 16,
  },
  tournamentDate: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: "lightgrey",
  },
  noScheduleText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
  scrollContainer: {
    padding: 15,
    paddingTop: 0,
    paddingBottom: 50,
  },
});

export default Tournaments;
