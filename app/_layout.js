import React, { useState, useEffect } from "react";
import { Alert, StatusBar } from "react-native";
import { useFonts } from "expo-font";
import messaging from "@react-native-firebase/messaging";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as SplashScreen from "expo-splash-screen";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import { TournamentProvider } from "./tournamentContext";
import { useTournamentContext } from "./tournamentContext";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Profile from "./screens/profile";
import Gpt from "./screens/gpt";
import Tool from "./screens/tool";
import Esports from "./screens/esports";
import PlayerStats from "./screens/playerstats";
import Tournaments from "./screens/tournaments";
import tournamentDetail from "./screens/tournamentDetail";
import strings from "./i18n";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <TournamentProvider>
        <Tab.Navigator
          initialRouteName={strings.home}
          screenOptions={{
            tabBarStyle: {
              backgroundColor: "black",
              borderTopWidth: 0,
            },
            tabBarActiveTintColor: "rgb(241,249,88)",
            tabBarInactiveTintColor: "#808080",
          }}
        >
          <Tab.Screen
            name={strings.home}
            component={Esports}
            options={{
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome6 name="house" size={20} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name={strings.tournament}
            component={Tournaments}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesome6 name="trophy" size={20} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name={strings.stat}
            component={Profile}
            options={{
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome6 name="chart-simple" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name={strings.tool}
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
    </>
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
    const authStatus = await messaging().hasPermission();
    const isAccepted = JSON.parse(await AsyncStorage.getItem("isAccepted"));

    if (authStatus == 1) {
      await AsyncStorage.setItem("isAccepted", JSON.stringify(true));
    } else {
      await AsyncStorage.setItem("isAccepted", JSON.stringify(false));
    }
    console.log("authStatus:", authStatus);
    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      await AsyncStorage.setItem("isAccepted", JSON.stringify(true));
    } else {
      const permissionStatus = await messaging().requestPermission();
      if (
        permissionStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        permissionStatus === messaging.AuthorizationStatus.PROVISIONAL
      ) {
        await AsyncStorage.setItem("isAccepted", JSON.stringify(true));
        await AsyncStorage.setItem("isSubscribed", JSON.stringify(true));
        if (!isSubscribed) {
          subscribeToTournamentTopic();
        }
      } else {
        await AsyncStorage.setItem("isAccepted", JSON.stringify(false));
        const subscribedStatus = await JSON.parse(
          AsyncStorage.getItem("isSubscribed")
        );

        if (subscribedStatus == null) {
          await AsyncStorage.setItem("isSubscribed", JSON.stringify(false));
        }
      }
    }
  }
  function subscribeToTournamentTopic() {
    messaging().unsubscribeFromTopic("tournament");

    messaging()
      .subscribeToTopic("tournament")
      .catch((err) => console.log("토픽 구독 오류:", err));
  }
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const { title, body } = remoteMessage.notification;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || "알림",
          body: body || "새로운 메시지가 도착했습니다.",
        },
        trigger: null,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    const getNetworkState = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          Alert.alert(
            "네트워크 연결 오류",
            "네트워크 연결을 확인하고 앱을 재시작해 주세요.",
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
  }, []);
  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
      requestPermission();
    }
  }, [fontsLoaded]);
  if (!appReady) {
    return null;
  }
  return (
    <TournamentProvider>
      <MainApp />
    </TournamentProvider>
  );
};
const MainApp = () => {
  const { loading } = useTournamentContext();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  return (
    <TournamentProvider>
      <Stack.Navigator>
        <Stack.Screen
          name={strings.return}
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="PlayerStats" component={PlayerStats} />
        <Stack.Screen
          name="Gpt"
          options={{
            headerStyle: {
              backgroundColor: "black",
            },
            headerTintColor: "rgb(241,249,88)",
          }}
          component={Gpt}
        />
        <Stack.Screen
          name="TournamentDetail"
          options={{
            headerStyle: {
              backgroundColor: "black",
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
