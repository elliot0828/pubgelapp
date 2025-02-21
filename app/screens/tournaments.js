import React, { useEffect, useState, useMemo, useRef } from "react";
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
  Switch,
} from "react-native";
import responsiveSize from "../utils/responsiveSize";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import axios from "axios";
const { responsiveWidth, responsiveHeight, responsiveFontSize } =
  responsiveSize;
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import initFirebase from "../firebase"; // 경로는 파일 구조에 맞게 수정
const { app, auth, db } = initFirebase();
import moment from "moment";
import { useFonts } from "expo-font";
import { ScrollView } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("📌 푸시 토큰:", token);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

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

  const [markedDates, setMarkedDates] = useState({});
  const [isEnabled, setIsEnabled] = useState(false);
  const [tournamentsData, setTournaments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [notification, setNotification] = useState(undefined);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const sendToken = async () => {
    if (expoPushToken) {
      try {
        const response = axios.post("http://192.168.0.8:3000/save-token", {
          expoPushToken,
        });
        await console.log("서버에 토큰 저장 성공:", response, expoPushToken);
      } catch (error) {
        console.error("서버에 토큰 저장 실패:", error);
      }
    } else {
      console.warn("🚨 푸시 토큰이 없습니다.");
    }
  };
  const changeToken = async () => {
    if (expoPushToken) {
      try {
        const response = axios.post("http://192.168.0.8:3000/change-token", {
          expoPushToken,
        });
        await console.log("서버에 토큰 저장 성공:", response, expoPushToken);
      } catch (error) {
        console.error("서버에 토큰 저장 실패:", error);
      }
    } else {
      console.warn("🚨 푸시 토큰이 없습니다.");
    }
  };
  const sendmsg = async () => {
    if (expoPushToken) {
      try {
        const response = axios.post(
          "http://192.168.0.8:3000/send-push-notification",
          {
            expoPushToken,
            title: "테스ㅡ트",
            body: "문서",
          }
        );
        await console.log("서버에 토큰 저장 성공:", response, expoPushToken);
      } catch (error) {
        console.error("서버에 토큰 저장 실패:", error);
      }
    } else {
      console.warn("🚨 푸시 토큰이 없습니다.");
    }
  };
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log("📌 useEffect 내부 token:", token); // 여기 로그 잘 찍히는지 확인!
        setExpoPushToken(token ?? "");
      })
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  // 🔥 일정 데이터를 불러오면서 markedDates 생성
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const scheduleQuery = await getDocs(collection(db, "schedule"));
        if (scheduleQuery.empty) {
          console.log("토너먼트 일정이 없습니다");
        } else {
          const scheduleData = [];
          const newMarkedDates = {};

          scheduleQuery.forEach((doc) => {
            let matchDate = doc.data().startAt.slice(0, 10);
            scheduleData.push({
              id: doc.data().matchScheduleId,
              matchDate: matchDate,
              ...doc.data(),
            });

            // 기존 markedDates 유지하면서 일정 날짜 추가
            newMarkedDates[matchDate] = {
              marked: true,
              dotColor: "rgb(241,249,88)",
            };
          });

          setTournaments(scheduleData);

          // 선택한 날짜 강조 (처음에는 오늘 날짜)
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
            scheduleData.filter((t) => t.matchDate === selectedDate)
          );
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);
  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const alertQuery = await getDocs(collection(db, "alert"));
        if (alertQuery.empty) {
          console.log("알림 받을 토큰이 없습니다");
        } else {
          alertQuery.forEach((doc) => {
            if (doc.id == expoPushToken) {
              if (doc.data().status == true) {
                setIsEnabled(true);
              } else {
                setIsEnabled(false);
              }
            }
          });
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchAlert();
  }, [expoPushToken]);
  // 🔄 날짜 선택 시 markedDates 업데이트
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

  const handleSwitchOn = () => {
    setTimeout(() => {
      sendToken();
    }, 500);

    // 여기에 켰을 때 실행할 로직을 추가
  };

  // 껐을 때 실행할 함수
  const handleSwitchOff = () => {
    setTimeout(() => {
      changeToken();
    }, 500);
    // 여기에 껐을 때 실행할 로직을 추가
  };
  const toggleSwitch = (value) => {
    setIsEnabled(value);
    if (value) {
      handleSwitchOn(); // 켰을 때 함수 실행
    } else {
      handleSwitchOff(); // 껐을 때 함수 실행
    }
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
        <Calendar
          current={new Date().toISOString().split("T")[0]}
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
                height: height * 0.35,
              }}
              contentContainerStyle={{ paddingBottom: responsiveHeight(50) }}
              // ListFooterComponent={
              //   <View
              //     style={{ height: 150, width: width, backgroundColor: "red" }}
              //   />
              // } // 리스트 끝에 여백 추가
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "black",
//     paddingTop: 50,

//     paddingHorizontal: 20,
//   },
//   scheduleContainer: {
//     marginTop: 5,
//     paddingTop: 10,

//     paddingHorizontal: 15,
//     marginBottom: 10,
//   },

//   tournamentTitle: {
//     fontFamily: "Pretendard-Bold",
//     color: "white",
//     fontSize: 16,
//     maxWidth: width * 0.65,
//   },
//   tournamentItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: "#1A1A1A",
//     borderRadius: 10,
//     marginBottom: 15,
//     borderTopColor: "rgb(241,249,88)",
//     borderTopWidth: 2,
//     alignItems: "center",
//     flexDirection: "row",
//     flexWrap: "wrap", // 텍스트와 버튼이 겹치지 않게 함
//   },
//   tournamentTitle2: {
//     fontFamily: "Pretendard-Bold",
//     color: "white",
//     fontSize: 16,
//     flexShrink: 1, // 텍스트가 공간을 초과할 경우 잘리도록 설정
//   },
//   tournamentDate: {
//     fontFamily: "Pretendard-Regular",
//     color: "#B4B4B4",
//     fontSize: 14,
//     flexShrink: 1, // 텍스트가 공간을 초과할 경우 잘리도록 설정
//   },
//   // tournamentDate: {
//   //   fontFamily: "Pretendard-Regular",
//   //   fontSize: 14,
//   //   color: "lightgrey",
//   // },
//   noScheduleText: {
//     fontSize: 16,
//     color: "#777",
//     textAlign: "center",
//   },
//   scrollContainer: {
//     padding: 15,
//     paddingTop: 0,
//     paddingBottom: 50,
//   },
// });
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
