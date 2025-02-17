import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
const { width, height } = Dimensions.get("window");
import { useFonts } from "expo-font";
const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlNTRiYTY1MC1lM2VhLTAxM2EtMWVjNy02YmM5MzNkNDQ3NzciLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjU3NjE0NjY1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InB1Ymctc3RhdC1ib3QifQ.2rKXN9meNKkC88vG54GcneCFNTBteBFVFAUPgi7ca_0";
const Tool = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.otf"),
    BrigendsExpanded: require("../../assets/fonts/BrigendsExpanded.otf"),
  });
  const [platform, setPlatform] = useState("");
  const [ign, setIgn] = useState("");
  const [result, setResult] = useState(null);
  const [Loading, setLoading] = useState(false);
  const handleSearch = async () => {
    setLoading(true);
    let playerOBJ = {
      ign: ign,
      platform: platform,
      banType: null,
    };
    console.log(playerOBJ);
    try {
      const response = await fetch(
        `https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${ign}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`, // 실제 API_KEY를 넣어주세요
            Accept: "application/vnd.api+json",
          },
        }
      );

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        console.log(data);
        let banType = data["data"][0]["attributes"]["banType"];
        if (banType == "Innocent") {
          banType = "해당 계정에 적용된 제재가 존재하지 않습니다.";
        } else if (banType == "TemporaryBan") {
          banType = "임시 제재 조치된 계정입니다.";
        } else if (banType == "PermanentBan") {
          banType = "영구 제재 조치된 계정입니다.";
        }
        playerOBJ["banType"] = banType;

        setResult(playerOBJ);
      } else {
        setPlayerData(null); // 데이터 없을 경우
      }
    } catch (error) {
      playerOBJ["banType"] = "존재하지 않는 계정입니다.";
      setResult(playerOBJ);
    } finally {
      setResult(playerOBJ);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>PUBG Tool</Text>
        <Text style={styles.subtitle}>계정 제재 확인</Text>
        <Text style={styles.subsubtitle}>PUBG 플랫폼 선택</Text>
        <View style={styles.platformButtonsContainer}>
          {["STEAM", "KAKAO", "XBOX", "PSN"].map((platformOption) => (
            <TouchableOpacity
              key={platformOption}
              style={[
                styles.platformButton,
                platform === platformOption && styles.selectedPlatform,
              ]}
              onPress={() => setPlatform(platformOption.toLowerCase())}
            >
              <Text
                style={[
                  styles.platformButtonText,
                  platform === platformOption && styles.selectedPlatformText,
                ]}
              >
                {platformOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subsubtitle}>PUBG 닉네임</Text>
        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
          }}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요. (대소문자 구분)"
              placeholderTextColor="gray"
              onChangeText={(text) => setIgn(text)}
              onPress={() => setIgn("")}
              value={ign}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>전적 조회</Text>
          </TouchableOpacity>
        </View>
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result.banType}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  platformButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  platformButton: {
    backgroundColor: "rgb(241,249,88)",
    padding: 10,
    borderRadius: 10,
    width: "24%",
    alignItems: "center",
  },
  platformButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 15,
  },
  resultContainer: {
    marginTop: 0,
    backgroundColor: "#545454",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
  },
  resultText: {
    fontSize: 15,
    fontFamily: "Pretendard-Bold",
    textAlign: "center",
    color: "white",
    marginBottom: 5,
  },
  subsubtitle: {
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: "rgb(241,249,88)",
    padding: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchButtonText: {
    color: "black",
    fontSize: 13,
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },
  subtitle: {
    color: "white",
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  scrollContainer: {
    padding: 15,
    paddingTop: 0,
    paddingBottom: 50,
    alignItems: "center",
  },

  input: {
    textAlign: "center",
    width: 240,
    height: 40,
    borderColor: "rgb(241,249,88)",
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    color: "white",
    marginBottom: 10,
    fontFamily: "Pretendard-Bold",
  },
  container: {
    flex: 1,
    width: width,
    backgroundColor: "black",
  },
  title: {
    fontSize: 24,
    color: "rgb(241,249,88)",
    fontFamily: "BrigendsExpanded",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Tool;
