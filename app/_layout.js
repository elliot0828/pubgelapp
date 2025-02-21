import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, View, Text, Button } from "react-native";
import { useFonts } from "expo-font";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as SplashScreen from "expo-splash-screen";

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

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true); // 폰트가 로드되면 앱 준비 상태를 true로 설정
      //  console.log("폰트 로딩됨:", fontsLoaded, expoPushToken);
      SplashScreen.hideAsync(); // 폰트가 로드되면 스플래시 화면 숨기기
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return null; // 폰트가 로드될 때까지 스플래시 화면을 유지
  }

  return (
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
  );
};

export default App;
