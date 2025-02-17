import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
} from "react-native";
import * as Network from "expo-network";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Profile from "./screens/profile";
import Gpt from "./screens/gpt";
import Tool from "./screens/tool";
import Esports from "./screens/esports";
import PlayerStats from "./screens/playerstats";
import Chat from "./screens/chat";
import Home from "./screens/home";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="PUBG"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "black", // 탭 배경색 설정
          borderTopWidth: 0.2,
        },
        tabBarActiveTintColor: "rgb(241,249,88)", // 활성화된 탭 색상 (빨간색)
        tabBarInactiveTintColor: "#808080", // 비활성화된 탭 색상 (회색)
      }}
    >
      <Tab.Screen
        name="STAT"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="PUBG"
        component={Home}
        options={{
          headerShown: false,
          tabBarActiveTintColor: "#ffa200",
        }}
      />
      <Tab.Screen
        name="ESPORTS"
        component={Esports}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="TOOL"
        component={Tool}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected);

      // 연결이 안 되어 있을 경우
      if (!networkState.isConnected) {
        Alert.alert(
          "인터넷 연결 오류",
          "인터넷에 연결되지 않았습니다. 앱을 종료합니다.",
          [
            {
              text: "확인",
              onPress: () => {
                // 앱 종료
                BackHandler.exitApp();
              },
            },
          ]
        );
      }
    };

    checkConnection();

    // 앱이 포그라운드로 돌아올 때 네트워크 상태 확인
    const unsubscribe = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        checkConnection();
        return true;
      }
    );

    // Clean up
    return () => unsubscribe.remove();
  }, []);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="돌아가기"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PlayerStats" component={PlayerStats} />
      <Stack.Screen name="Gpt" component={Gpt} />
    </Stack.Navigator>
  );
};

export default App;
