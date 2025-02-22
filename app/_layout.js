import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  Text,
  Button,
  Alert,
  BackHandler,
} from "react-native";
import { useFonts } from "expo-font";
import messaging from "@react-native-firebase/messaging";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as SplashScreen from "expo-splash-screen";
import * as Network from "expo-network";
import { TournamentProvider } from "./tournamentContext";
import { useTournamentContext } from "./tournamentContext";
//푸시 알림
// 화면 컴포넌트들 (예시로 Esports와 Profile)
import Profile from "./screens/profile";
import Gpt from "./screens/gpt";
import Tool from "./screens/tool";
import Esports from "./screens/esports";
import PlayerStats from "./screens/playerstats";
import Tournaments from "./screens/tournaments";
import tournamentDetail from "./screens/tournamentDetail";
import Chat from "./screens/chat";
import Home from "./screens/home";

// 스플래시 화면을 계속 보여주기 위한 설정
SplashScreen.preventAutoHideAsync(); // 앱 실행 시 자동으로 스플래시 화면 숨김을 막음

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

//ui
const TabNavigator = () => {
  return (
    <TournamentProvider>
      <Tab.Navigator
        initialRouteName="홈"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "black",
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: "rgb(241,249,88)", // 활성화된 탭 색상
          tabBarInactiveTintColor: "#808080", // 비활성화된 탭 색상
        }}
      >
        <Tab.Screen
          name="홈"
          component={Esports}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="house" size={20} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="토너먼트"
          component={Tournaments}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome6 name="trophy" size={20} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="전적"
          component={Profile}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="chart-simple" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="도구"
          component={Tool}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome6 name="wrench" size={20} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </TournamentProvider>
  );
};

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../assets/fonts/BrigendsExpanded.otf"),
  });
  async function requestPermission() {
    console.log("알림 권한 요청 중...");
    const authStatus = await messaging().hasPermission();
    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      console.log("이미 알림 권한이 허용됨");

      subscribeToTournamentTopic();
    } else {
      const permissionStatus = await messaging().requestPermission();
      console.log("Requested Permission Status:", permissionStatus);
      if (
        permissionStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        permissionStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        console.log("FCM 알림 권한 허용됨");
        subscribeToTournamentTopic();
      } else {
        Alert.alert(
          "알림 권한 필요",
          "토너먼트 알람을 받으려면 알림을 허용해주세요."
        );
      }
    }
  }
  function subscribeToTournamentTopic() {
    messaging()
      .subscribeToTopic("tournament")
      .then(() => console.log("토너먼트 알림 구독 완료!"))
      .catch((err) => console.log("토픽 구독 오류:", err));
  }
  useEffect(() => {
    // 앱 실행 중 푸시 알림 수신 처리
    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        console.log("푸시 알림 도착: ", remoteMessage);
        // 알림을 직접 표시하거나 처리
        Alert.alert("알림", remoteMessage.notification.body);
      }
    );

    // 백그라운드 상태에서 알림을 클릭하면 실행될 함수
    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log("백그라운드에서 알림을 클릭: ", remoteMessage);
        // 알림을 클릭하면 특정 화면으로 이동하도록 처리 가능
      });

    // 앱이 종료된 상태에서 알림을 클릭하면 실행될 함수
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("앱 종료 상태에서 알림을 클릭: ", remoteMessage);
          // 앱 종료 상태에서 알림을 클릭한 경우에도 알림 처리
        }
      });

    // 백그라운드 메시지 처리 (종료된 상태에서 알림을 처리할 때 필요)
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("백그라운드에서 알림 수신: ", remoteMessage);
      // 알림을 수신했을 때 원하는 작업 처리
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      // 이벤트 리스너 해제
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);
  useEffect(() => {
    const getNetworkState = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          Alert.alert(
            "네트워크 연결 오류",
            "네트워크 연결을 확인해주세요.",
            [
              {
                text: "확인",
                onPress: () => {
                  getNetworkState();
                },
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error("Error fetching network state:", error);
      }
    };

    getNetworkState();
  }, []); // 빈 배열을 넣어서 처음 한 번만 실행되도록 설정
  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true); // 폰트가 로드되면 앱 준비 상태를 true로 설정
      SplashScreen.hideAsync(); // 폰트가 로드되면 스플래시 화면 숨기기
    }
  }, [fontsLoaded]);
  if (!appReady) {
    return null; // 폰트 로딩 중이거나 Tournament 데이터 로딩 중일 때 스플래시 화면 유지
  }
  return (
    <TournamentProvider>
      <MainApp />
    </TournamentProvider>
  );
  // const context = useTournamentContext();
};
const MainApp = () => {
  const { loading } = useTournamentContext(); // ✅ Tournament 로딩 상태 확인

  useEffect(() => {
    console.log(loading);
    if (!loading) {
      SplashScreen.hideAsync(); // ✅ Tournament 데이터 로드 완료 후 스플래시 해제
    }
  }, [loading]);

  if (loading) {
    return null; // ✅ Tournament 데이터 로딩 중이면 스플래시 유지
  }

  return (
    <TournamentProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="돌아가기"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="PlayerStats" component={PlayerStats} />
        <Stack.Screen name="Gpt" component={Gpt} />
        <Stack.Screen
          name="TournamentDetail"
          options={{
            headerStyle: {
              backgroundColor: "black", // 헤더 배경 색
              title: "토너먼트 상세보기",
            },
            headerTintColor: "rgb(241,249,88)",
          }}
          component={tournamentDetail}
        />
      </Stack.Navigator>
    </TournamentProvider>
  );
};
export default App;
