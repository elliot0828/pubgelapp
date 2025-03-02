import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import strings from "../i18n";
import responsiveSize from "../utils/responsiveSize";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import initFirebase from "../firebase";
const { db } = initFirebase();
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
  const [rankingdata, setrankingData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rankingQuery = await getDocs(
          query(collection(db, "tpRanking"), orderBy("point", "desc"))
        );

        if (rankingQuery.empty) {
          console.log("파워랭킹 데이터가 없습니다.");
        } else {
          const prankingData = [];
          rankingQuery.forEach((doc) => {
            prankingData.push({ id: doc.id, ...doc.data() });
          });
          setrankingData(prankingData);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);
  const handleSearch = async () => {
    setLoading(true);
    let playerOBJ = {
      ign: ign,
      platform: platform,
      banType: null,
    };

    try {
      const response = await fetch(
        `https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${ign}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/vnd.api+json",
          },
        }
      );

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        let banType = data["data"][0]["attributes"]["banType"];
        if (banType == "Innocent") {
          banType = `${strings.innocent}`;
        } else if (banType == "TemporaryBan") {
          banType = `${strings.temporary}`;
        } else if (banType == "PermanentBan") {
          banType = `${strings.permanent}`;
        }
        playerOBJ["banType"] = banType;

        setResult(playerOBJ);
      } else {
        setPlayerData(null);
      }
    } catch (error) {
      playerOBJ["banType"] = `${strings.exist}`;
      setResult(playerOBJ);
    } finally {
      setResult(playerOBJ);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>PUBG Tool</Text>
        <Text style={styles.subtitle}>{strings.accountCheck}</Text>
        <Text style={styles.subsubtitle}>{strings.accountPlatform}</Text>
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

        <Text style={styles.subsubtitle}>{strings.accountIgn}</Text>
        <View
          style={{
            flexDirection: "row",
            alignContent: "center",
          }}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={strings.ign_holder}
              placeholderTextColor="gray"
              onChangeText={(text) => setIgn(text)}
              onPress={() => setIgn("")}
              value={ign}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>{strings.accountBTN}</Text>
          </TouchableOpacity>
        </View>
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result.banType}</Text>
          </View>
        )}
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontFamily: "Pretendard-Bold",
            fontSize: responsiveFontSize(20),
            padding: responsiveWidth(10),
            marginTop: responsiveHeight(5),
            color: "white",
            width: width * 0.9,
          }}
        >
          {strings.pptR}
        </Text>
        <View
          style={{
            marginTop: responsiveHeight(5),
            borderTopColor: "rgb(241,249,88)",
            borderWidth: responsiveWidth(3),
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontFamily: "Pretendard-Bold",
              fontSize: responsiveFontSize(20),
              padding: responsiveWidth(10),
              color: "rgb(241,249,88)",
              width: width * 0.9,
            }}
          >
            {strings.tpR}
          </Text>
        </View>
        <View style={styles.rankingContainer}>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: responsiveWidth(10),
            }}
          >
            <Text style={styles.rtext}>Rank</Text>
            <Text style={styles.ttext}>Team</Text>
            <Text style={styles.ptext}>TP</Text>
          </View>
          <ScrollView contentContainerStyle={styles.rankingListContent}>
            {rankingdata.map((item) => (
              <View key={item.teamName} style={[styles.rankingItem]}>
                <Text style={styles.rankText}>{item.rank}</Text>
                <Text style={styles.teamText}>{item.teamName}</Text>
                <Text style={styles.pointText}>{item.point}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
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
    backgroundColor: "#171717",
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
    paddingVertical: responsiveHeight(5),
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
    width: responsiveWidth(230),
    height: responsiveHeight(30),
    borderColor: "rgb(241,249,88)",
    borderRadius: responsiveWidth(5),
    borderWidth: responsiveWidth(1),
    paddingHorizontal: responsiveWidth(10),
    color: "white",
    marginBottom: responsiveHeight(10),
    fontFamily: "Pretendard-Bold",
    fontSize: responsiveFontSize(15),
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
  rankingContainer: {
    width: "100%",
    height: height * 0.4,
    overflow: "scroll",
    backgroundColor: "rgb(241,241,241)",
    padding: responsiveWidth(15),
  },
  rankingItem: {
    // backgroundColor: "#545454",
    padding: responsiveWidth(10),
    borderBottomWidth: responsiveWidth(1),
    borderBottomColor: "#ddd",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  rankingText: {
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
  },
  rtext: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "25%",

    textAlign: "center",
    fontSize: responsiveFontSize(15),
  },
  ttext: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "50%",
    textAlign: "center",
    fontSize: responsiveFontSize(15),
  },
  ptext: {
    fontFamily: "Pretendard-Bold",
    color: "#888",
    width: "25%",
    textAlign: "center",

    fontSize: responsiveFontSize(15),
  },
  rankText: {
    width: "25%",
    fontSize: responsiveFontSize(15),
    fontWeight: "bold",
    textAlign: "center",
  },
  teamText: {
    width: "50%",
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  pointText: {
    width: "25%",

    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});

export default Tool;
