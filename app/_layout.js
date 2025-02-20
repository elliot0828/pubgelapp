import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Profile from "./screens/profile";
import Gpt from "./screens/gpt";
import Tool from "./screens/tool";
import Esports from "./screens/esports";
import PlayerStats from "./screens/playerstats";
import Tournaments from "./screens/tournaments";
import tournamentDetail from "./screens/tournamentDetail";
import Chat from "./screens/chat";
import Home from "./screens/home";
import * as Network from "expo-network";
import { useFonts } from "expo-font";
const Tab = createBottomTabNavigator();
import * as SplashScreen from "expo-splash-screen";
const Stack = createStackNavigator();
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "black", // 탭 배경색 설정
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "rgb(241,249,88)", // 활성화된 탭 색상 (빨간색)
        tabBarInactiveTintColor: "#808080", // 비활성화된 탭 색상 (회색)
      }}
    >
      <Tab.Screen
        name="홈"
        component={Esports}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
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
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome6 name="chart-simple" size={20} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="PUBG"
        component={Home}
        options={{
          headerShown: false,
          tabBarActiveTintColor: "#ffa200",
        }}
      /> */}

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
    async function prepareApp() {
      setAppReady(true);
      await SplashScreen.hideAsync(); // 스플래시 숨기기
    }

    if (fontsLoaded) {
      prepareApp();
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return null; // 스플래시 화면 유지
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
