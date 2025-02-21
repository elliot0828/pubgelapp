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
import responsiveSize from "../utils/responsiveSize";

const { responsiveWidth, responsiveHeight, responsiveFontSize } =
  responsiveSize;
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
    marginBottom: responsiveHeight(10),
  },
  platformButton: {
    backgroundColor: "rgb(241,249,88)",
    padding: responsiveWidth(10),
    borderRadius: responsiveWidth(8),
    width: "24%",
    alignItems: "center",
  },
  platformButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(15),
  },
  resultContainer: {
    backgroundColor: "#545454",
    padding: responsiveWidth(10),
    borderRadius: responsiveWidth(10),
    alignItems: "center",
    width: "90%",
  },
  resultText: {
    fontSize: responsiveFontSize(15),
    fontFamily: "Pretendard-Bold",
    textAlign: "center",
    color: "white",
    marginBottom: responsiveHeight(5),
  },
  subsubtitle: {
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(16),
    textAlign: "center",
    marginBottom: responsiveHeight(10),
  },
  searchButton: {
    backgroundColor: "rgb(241,249,88)",
    paddingVertical: responsiveHeight(10),
    paddingHorizontal: responsiveWidth(20),
    marginLeft: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    marginBottom: responsiveHeight(10),
    alignContent: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "black",
    fontSize: responsiveFontSize(15),
    fontFamily: "Pretendard-Regular",
    textAlign: "center",
  },
  subtitle: {
    color: "white",
    fontFamily: "Pretendard-Bold",
    fontSize: responsiveFontSize(20),
    textAlign: "center",
    marginBottom: responsiveHeight(10),
  },
  scrollContainer: {
    paddingHorizontal: responsiveWidth(15),
    paddingVertical: responsiveHeight(15),
    paddingTop: 0,
    paddingBottom: responsiveHeight(50),
    alignItems: "center",
  },

  input: {
    textAlign: "center",
    width: responsiveWidth(200),
    height: responsiveHeight(45),
    borderColor: "rgb(241,249,88)",
    borderRadius: responsiveWidth(5),
    borderWidth: responsiveWidth(1),
    paddingHorizontal: responsiveWidth(10),
    color: "white",
    marginBottom: responsiveHeight(10),
    fontFamily: "Pretendard-Bold",
    fontSize: responsiveFontSize(17),
  },
  container: {
    flex: 1,
    width: width,
    backgroundColor: "black",
    paddingHorizontal: responsiveWidth(15),
  },
  title: {
    fontSize: responsiveFontSize(24),
    color: "rgb(241,249,88)",
    fontFamily: "BrigendsExpanded",
    textAlign: "center",
    marginBottom: responsiveHeight(10),
  },
});

export default Tool;
