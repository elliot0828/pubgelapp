import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import responsiveSize from "../utils/responsiveSize";

const { responsiveWidth, responsiveHeight, responsiveFontSize } =
  responsiveSize;
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlNTRiYTY1MC1lM2VhLTAxM2EtMWVjNy02YmM5MzNkNDQ3NzciLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjU3NjE0NjY1LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InB1Ymctc3RhdC1ib3QifQ.2rKXN9meNKkC88vG54GcneCFNTBteBFVFAUPgi7ca_0";

const rankImages = {
  "Unranked-1": require("../../assets/rank/Unranked.png"),
  "Bronze-1": require("../../assets/rank/Bronze-1.png"),
  "Bronze-2": require("../../assets/rank/Bronze-2.png"),
  "Bronze-3": require("../../assets/rank/Bronze-3.png"),
  "Bronze-4": require("../../assets/rank/Bronze-4.png"),
  "Bronze-5": require("../../assets/rank/Bronze-5.png"),
  "Silver-1": require("../../assets/rank/Silver-1.png"),
  "Silver-2": require("../../assets/rank/Silver-2.png"),
  "Silver-3": require("../../assets/rank/Silver-3.png"),
  "Silver-4": require("../../assets/rank/Silver-4.png"),
  "Silver-5": require("../../assets/rank/Silver-5.png"),
  "Gold-1": require("../../assets/rank/Gold-1.png"),
  "Gold-2": require("../../assets/rank/Gold-2.png"),
  "Gold-3": require("../../assets/rank/Gold-3.png"),
  "Gold-4": require("../../assets/rank/Gold-4.png"),
  "Gold-5": require("../../assets/rank/Gold-5.png"),
  "Platinum-1": require("../../assets/rank/Platinum-1.png"),
  "Platinum-2": require("../../assets/rank/Platinum-2.png"),
  "Platinum-3": require("../../assets/rank/Platinum-3.png"),
  "Platinum-4": require("../../assets/rank/Platinum-4.png"),
  "Platinum-5": require("../../assets/rank/Platinum-5.png"),
  "Diamond-1": require("../../assets/rank/Diamond-1.png"),
  "Diamond-2": require("../../assets/rank/Diamond-2.png"),
  "Diamond-3": require("../../assets/rank/Diamond-3.png"),
  "Diamond-4": require("../../assets/rank/Diamond-4.png"),
  "Diamond-5": require("../../assets/rank/Diamond-5.png"),
  "Master-1": require("../../assets/rank/Master-1.png"),
};

const PlayerStats = ({ route }) => {
  const [fontsLoaded] = useFonts({
    "PUBGBattlegrounds-Textured": require("../../assets/fonts/PUBGBattlegrounds-Textured.ttf"),
    "WinnerSans-CompBold": require("../../assets/fonts/WinnerSans-CompBold.otf"),
    "AgencyFB-Bold": require("../../assets/fonts/AgencyFB-Bold.ttf"),
    "Pretendard-Regular": require("../../assets/fonts/Pretendard-Regular.otf"),
  });

  const { ign, platform, seasonNum, seasonList } = route.params;
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(
    seasonList[0]["id"][platform]
  );
  const [selectedGameMode, setSelectedGameMode] = useState("normal");
  const [isNormalSelected, setIsNormalSelected] = useState(true);
  const navigation = useNavigation();
  const [fontLoaded, setFontLoaded] = useState(false);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(seasonList);

  useEffect(() => {
    setItems(seasonList);
  }, [seasonList]);

  useEffect(() => {
    navigation.setOptions({
      title: ign + "의 전적",
      headerStyle: {
        backgroundColor: "black",
      },
      headerTintColor: "rgb(241,249,88)",
    });

    const fetchPlayerStats = async () => {
      setLoading(true);
      let playerOBJ = {
        ign: ign,
        platform: platform,
        accID: null,
        matchIDs: null,
        stats: null,
        seasonID: null,
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
          playerOBJ["accID"] = data["data"][0]["id"];
          playerOBJ["matchIDs"] = data["data"][0]["relationships"]["matches"];
          playerOBJ["seasonID"] = selectedSeason;
          let updatedStat = await getData(playerOBJ);
          playerOBJ["stats"] = updatedStat;

          setPlayerData(playerOBJ);
        } else {
          setPlayerData(null);
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
        setPlayerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, [ign, platform, selectedSeason, selectedGameMode]);

  const handleNormalPress = () => {
    setIsNormalSelected(true);
    setSelectedGameMode("normal");
    setLoading(true);
  };
  const handleRankedPress = () => {
    setIsNormalSelected(false);
    setSelectedGameMode("ranked");
    setLoading(true);
  };
  const handleHistoryPress = () => {
    setSelectedGameMode("history");
    setLoading(true);
  };
  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <DropDownPicker
        open={open}
        value={selectedSeason}
        items={items.map((season) => ({
          label: season.text,
          value: season.id[platform],
        }))}
        setOpen={setOpen}
        setValue={setSelectedSeason}
        setItems={setItems}
        placeholder="시즌 선택"
        containerStyle={styles.dropdownContainer}
        dropDownContainerStyle={{
          backgroundColor: "rgba(52,52,52,1)",
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }}
        textStyle={{
          fontSize: responsiveFontSize(15),
          textAlign: "center",
        }}
        style={{
          backgroundColor: "rgba(241,249,88,1)",
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }}
        disabledStyle={{
          opacity: 0.5,
        }}
        labelStyle={{
          fontWeight: "bold",

          fontSize: responsiveFontSize(18),
        }}
        listItemLabelStyle={{
          color: "white",
        }}
        placeholderStyle={{
          color: "white",
        }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedGameMode === "normal"
              ? styles.selectedButton
              : styles.deselectedButton,
          ]}
          onPress={handleNormalPress}
        >
          <Text
            style={
              selectedGameMode === "normal"
                ? styles.selectedButtonText
                : styles.deselectedButtonText
            }
          >
            일반전
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            selectedGameMode === "ranked"
              ? styles.selectedButton
              : styles.deselectedButton,
          ]}
          onPress={handleRankedPress}
        >
          <Text
            style={
              selectedGameMode === "ranked"
                ? styles.selectedButtonText
                : styles.deselectedButtonText
            }
          >
            경쟁전
          </Text>
        </TouchableOpacity>
      </View>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView>
          {loading ? (
            <ActivityIndicator size="large" color="rgb(241,249,88)" />
          ) : playerData ? (
            selectedGameMode === "normal" ? (
              <View style={styles.statsContainer}>
                <View
                  style={{
                    height: responsiveHeight(120),
                    marginBottom: responsiveHeight(30),
                  }}
                >
                  <View
                    style={{
                      borderRadius: responsiveWidth(5),
                      flexDirection: "row",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        marginHorizontal: responsiveWidth(15),
                      }}
                    >
                      <View style={stats.seasonCon}>
                        <Text style={stats.seasonTitle}>SEASON</Text>
                        <Text style={stats.seasonNum}>
                          {selectedSeason[selectedSeason.length - 2] +
                            selectedSeason[selectedSeason.length - 1]}
                        </Text>
                      </View>
                      <View style={stats.avgCon}>
                        <View
                          style={{
                            flexDirection: "row",
                            height: "46%",
                            boxSizing: "border-box",
                            marginBottom: responsiveHeight(10),
                          }}
                        >
                          <View style={stats.avgStatCon}>
                            <Text style={stats.avgStatTitle}>승리</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.normal.wins}
                            </Text>
                          </View>

                          <View style={stats.avgStatCon}>
                            <Text style={stats.avgStatTitle}>탑10</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.normal.top10s}
                            </Text>
                          </View>

                          <View style={stats.avgStatCon}>
                            <Text style={stats.avgStatTitle}>패배</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.normal.losses}
                            </Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: "row", height: "46%" }}>
                          <View style={stats.avgStatCon}>
                            <Text style={stats.avgStatTitle}>승리 확률</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.normal.winRatio}
                            </Text>
                          </View>

                          <View style={stats.avgStatCon}>
                            <Text style={stats.avgStatTitle}>탑10 확률</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.normal.top10sRatio}
                            </Text>
                          </View>

                          <View style={stats.avgStatCon}>
                            <Text style={stats.avgStatTitle}>총 매치</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.normal.roundsPlayed}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={stats.combatCon}>
                  <View style={stats.typeCon}>
                    <Text style={stats.typeTitle}>전투</Text>
                  </View>
                  <View style={combat.con}>
                    <View style={{ flexDirection: "row" }}>
                      <View style={combat.lcon}>
                        <View style={combat.h}>
                          <Text style={combat.sh}>
                            {playerData.stats.normal.kills}
                          </Text>
                          <Text style={combat.th}>킬</Text>
                        </View>
                        <View style={combat.h}>
                          <Text style={combat.sh2}>
                            {playerData.stats.normal.avgDMG}
                          </Text>
                          <Text style={combat.th2}>평균 데미지</Text>
                        </View>
                      </View>
                      <View style={combat.rcon}>
                        <View style={combat.h}>
                          <Text style={combat.sh}>
                            {playerData.stats.normal.kda}
                          </Text>
                          <Text style={combat.th}>KDA</Text>
                        </View>
                        <View style={combat.h}>
                          <Text style={combat.sh2}>
                            {(
                              playerData.stats.normal.kills /
                              playerData.stats.normal.roundsPlayed
                            ).toFixed(1)}
                          </Text>
                          <Text style={combat.th2}>평균 킬</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={combat.cCon}>
                    <View style={combat.h3}>
                      <Text style={long.sh3}>
                        {playerData.stats.normal.damageDealt.toFixed(0)}
                      </Text>
                      <Text style={combat.th3}>데미지</Text>
                    </View>
                    <View style={combat.h3}>
                      <Text style={long.sh3}>
                        {playerData.stats.normal.dBNOs}
                      </Text>
                      <Text style={combat.th3}>기절</Text>
                    </View>
                    <View style={combat.h3}>
                      <Text style={long.sh3}>
                        {playerData.stats.normal.assists}
                      </Text>
                      <Text style={combat.th3}>어시스트</Text>
                    </View>
                  </View>
                </View>
                <View style={stats.combatCon}>
                  <View style={stats.typeCon}>
                    <Text style={stats.typeTitle}>매치 운영</Text>
                  </View>
                  <View style={run.con}>
                    <View style={{ flexDirection: "row" }}>
                      <View style={run.lcon}>
                        <View style={run.h}>
                          <Text style={run.lsh}>
                            {playerData.stats.normal.revives}
                          </Text>
                          <Text style={run.lth}>회복</Text>
                        </View>
                        <View style={run.h}>
                          <Text style={run.lsh2}>
                            {playerData.stats.normal.heals}
                          </Text>
                          <Text style={run.lth2}>치유</Text>
                        </View>
                        <View style={run.hc}>
                          <Text style={run.lsh2}>
                            {playerData.stats.normal.boosts}
                          </Text>
                          <Text style={run.lth2}>부스트</Text>
                        </View>
                      </View>
                      <View style={combat.rcon}>
                        <View style={combat.h}>
                          <Text style={long.fshD}>
                            {playerData.stats.normal.walkDistance}
                          </Text>
                          <Text style={combat.th}>걸은 거리</Text>
                        </View>
                        <View style={combat.h}>
                          <Text style={long.shD}>
                            {playerData.stats.normal.rideDistance}
                          </Text>
                          <Text style={combat.th2}>이동수단 탑승한 거리</Text>
                        </View>
                        <View style={run.h}>
                          <Text style={long.shD}>
                            {playerData.stats.normal.swimDistance}
                          </Text>
                          <Text style={combat.th2}>수영한 거리</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={stats.combatCon}>
                  <View style={stats.typeCon}>
                    <Text style={stats.typeTitle}>기록</Text>
                  </View>
                  <View style={combat.con}>
                    <View style={{ flexDirection: "row" }}>
                      <View style={combat.lcon}>
                        <View style={combat.h}>
                          <Text style={combat.sh}>
                            {playerData.stats.normal.headshotKills}
                          </Text>
                          <Text style={combat.th}>헤드샷 킬</Text>
                        </View>
                        <View style={run.h}>
                          <Text style={combat.sh2}>
                            {playerData.stats.normal.longestKill}
                          </Text>
                          <Text style={combat.th2}>최장거리 킬</Text>
                        </View>
                      </View>
                      <View style={combat.rcon}>
                        <View style={combat.h}>
                          <Text style={long.sshD}>
                            {playerData.stats.normal.timeSurvived}
                          </Text>
                          <Text style={combat.th}>생존시간</Text>
                        </View>
                        <View style={run.h}>
                          <Text style={long.shD}>
                            {playerData.stats.normal.longestTimeSurvived}
                          </Text>
                          <Text style={combat.th2}>최장 생존시간 </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ) : selectedGameMode === "ranked" ? (
              <View style={styles.statsContainer}>
                <View
                  style={{
                    height: responsiveHeight(120),
                    paddingTop: responsiveHeight(20),
                    marginBottom: responsiveHeight(40),
                  }}
                >
                  <View
                    style={{
                      borderRadius: responsiveWidth(5),
                      flexDirection: "row",
                      height: responsiveHeight(120),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        marginHorizontal: responsiveWidth(15),
                      }}
                    >
                      <View style={stats.seasonCon}>
                        <Text style={stats.seasonTitle}>SEASON</Text>
                        <Text style={stats.seasonNum}>
                          {selectedSeason[selectedSeason.length - 2] +
                            selectedSeason[selectedSeason.length - 1]}
                        </Text>
                      </View>
                      <View style={rstats.avgCon}>
                        <View style={{ flexDirection: "row" }}>
                          <Image
                            source={
                              rankImages[
                                `${playerData.stats.ranked.currentTier.tier}-${playerData.stats.ranked.currentTier.subTier}`
                              ]
                            }
                            style={rstats.tierIMG}
                          />
                          <View style={rstats.rp}>
                            <Text style={rstats.rpText}>
                              {playerData.stats.ranked.currentTier.tier}{" "}
                              {playerData.stats.ranked.currentTier.subTier}
                            </Text>
                            <Text style={rstats.rpPoint}>
                              {playerData.stats.ranked.currentRankPoint} RP
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: responsiveHeight(5),
                          }}
                        >
                          <View style={stats.avgStatCon}>
                            <Text style={rstats.avgStatTitle}>승리</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.ranked.wins}
                            </Text>
                          </View>

                          <View style={stats.avgStatCon}>
                            <Text style={rstats.avgStatTitle}>승리 확률</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.ranked.winRatio}
                            </Text>
                          </View>

                          <View style={stats.avgStatCon}>
                            <Text style={rstats.avgStatTitle}>총 매치</Text>
                            <Text style={stats.avgStatText}>
                              {playerData.stats.ranked.roundsPlayed}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={stats.combatCon}>
                  <View style={stats.typeCon}>
                    <Text style={stats.typeTitle}>전투</Text>
                  </View>
                  <View style={combat.con}>
                    <View style={{ flexDirection: "row" }}>
                      <View style={combat.lcon}>
                        <View style={combat.h}>
                          <Text style={combat.sh}>
                            {playerData.stats.ranked.kills}
                          </Text>
                          <Text style={combat.th}>킬</Text>
                        </View>
                        <View style={combat.h}>
                          <Text style={combat.sh2}>
                            {playerData.stats.ranked.avgDMG}
                          </Text>
                          <Text style={combat.th2}>평균 데미지</Text>
                        </View>
                      </View>
                      <View style={combat.rcon}>
                        <View style={combat.h}>
                          <Text style={combat.sh}>
                            {playerData.stats.normal.kda}
                          </Text>
                          <Text style={combat.th}>KDA</Text>
                        </View>
                        <View style={combat.h}>
                          <Text style={combat.sh2}>
                            {isNaN(
                              playerData.stats.ranked.kills /
                                playerData.stats.ranked.roundsPlayed
                            )
                              ? 0
                              : (
                                  playerData.stats.ranked.kills /
                                  playerData.stats.ranked.roundsPlayed
                                ).toFixed(1)}
                          </Text>
                          <Text style={combat.th2}>평균 킬</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={combat.cCon}>
                    <View style={combat.h3}>
                      <Text style={long.sh3}>
                        {playerData.stats.ranked.damageDealt.toFixed(0)}
                      </Text>
                      <Text style={combat.th3}>데미지</Text>
                    </View>
                    <View style={combat.h3}>
                      <Text style={long.sh3}>
                        {playerData.stats.ranked.dBNOs}
                      </Text>
                      <Text style={combat.th3}>기절</Text>
                    </View>
                    <View style={combat.h3}>
                      <Text style={long.sh3}>
                        {playerData.stats.ranked.assists}
                      </Text>
                      <Text style={combat.th3}>어시스트</Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.statsContainer}>
                <Text style={styles.statText}>선택된 모드가 없습니다.</Text>
              </View>
            )
          ) : (
            <Text style={styles.error}>No Data Found</Text>
          )}
        </ScrollView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

async function getData(obj) {
  let seasonID = obj["seasonID"];
  let nRes = await fetch(
    `https://api.pubg.com/shards/${obj["platform"]}/players/${obj["accID"]}/seasons/${seasonID}`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  let rRes = await fetch(
    `https://api.pubg.com/shards/${obj["platform"]}/players/${obj["accID"]}/seasons/${seasonID}/ranked`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  let nData = await nRes.json();
  let rData = await rRes.json();

  let rTypes = ["solo", "squad", "solo-fpp", "squad-fpp"];
  let rTotal = {
    currentRankPoint: 0,
    roundsPlayed: 0,
    assists: 0,
    wins: 0,
    kills: 0,
    deaths: 0,
    damageDealt: 0,
    dBNOs: 0,
    revives: 0,
    heals: 0,
    boosts: 0,
  };

  let nTypes = ["solo", "duo", "squad", "solo-fpp", "duo-fpp", "squad-fpp"];
  let nTotal = {
    assists: 0,
    boosts: 0,
    dBNOs: 0,
    damageDealt: 0,
    headshotKills: 0,
    heals: 0,
    kills: 0,
    longestKill: 0,
    longestTimeSurvived: 0,
    losses: 0,
    revives: 0,
    rideDistance: 0,
    roadKills: 0,
    roundsPlayed: 0,
    swimDistance: 0,
    timeSurvived: 0,
    top10s: 0,
    walkDistance: 0,
    weaponsAcquired: 0,
    wins: 0,
  };

  let nKeys = Object.keys(nTotal);
  for (let i = 0; i < nTypes.length; i++) {
    if (
      nData["data"]["attributes"]["gameModeStats"][nTypes[i]][
        "roundsPlayed"
      ] !== 0
    ) {
      for (let j = 0; j < nKeys.length; j++) {
        if (nKeys[j] !== "longestKill" && nKeys[j] !== "longestTimeSurvived") {
          nTotal[nKeys[j]] +=
            nData["data"]["attributes"]["gameModeStats"][nTypes[i]][nKeys[j]];
        } else {
          if (
            nTotal[nKeys[j]] <
            nData["data"]["attributes"]["gameModeStats"][nTypes[i]][nKeys[j]]
          ) {
            nTotal[nKeys[j]] =
              nData["data"]["attributes"]["gameModeStats"][nTypes[i]][nKeys[j]];
          }
        }
      }
    }
  }

  nTotal["longestKill"] = nTotal["longestKill"].toFixed(1) + "M";
  nTotal["rideDistance"] = (nTotal["rideDistance"] / 1000).toFixed() + "KM";
  nTotal["swimDistance"] = (nTotal["swimDistance"] / 1000).toFixed(0) + "KM";
  nTotal["walkDistance"] = (nTotal["walkDistance"] / 1000).toFixed(0) + "KM";
  nTotal["longestTimeSurvived"] =
    (nTotal["longestTimeSurvived"] / 60).toFixed(1) + "분";
  nTotal["timeSurvived"] = (nTotal["timeSurvived"] / 60).toFixed(0) + "분";

  nTotal["kda"] = (
    (nTotal["kills"] + nTotal["assists"]) /
    nTotal["losses"]
  ).toFixed(1);
  nTotal["avgDMG"] = (nTotal["damageDealt"] / nTotal["roundsPlayed"]).toFixed(
    2
  );
  nTotal["damageDealt"].toFixed(1);
  nTotal["winRatio"] =
    ((nTotal["wins"] / nTotal["roundsPlayed"]) * 100).toFixed(1) + "%";
  nTotal["top10sRatio"] =
    ((nTotal["top10s"] / nTotal["roundsPlayed"]) * 100).toFixed(1) + "%";

  let rKeys = Object.keys(rTotal);
  for (let i = 0; i < rTypes.length; i++) {
    if (
      rData["data"]["attributes"]["rankedGameModeStats"][rTypes[i]] !==
      undefined
    ) {
      for (let j = 0; j < rKeys.length; j++) {
        if (rKeys[j] == "currentRankPoint") {
          if (
            rData["data"]["attributes"]["rankedGameModeStats"][rTypes[i]][
              rKeys[j]
            ] > rTotal[rKeys[j]]
          ) {
            rTotal[rKeys[j]] =
              rData["data"]["attributes"]["rankedGameModeStats"][rTypes[i]][
                rKeys[j]
              ];
            rTotal["currentTier"] =
              rData["data"]["attributes"]["rankedGameModeStats"][rTypes[i]][
                "currentTier"
              ];
          }
        } else {
          rTotal[rKeys[j]] +=
            rData["data"]["attributes"]["rankedGameModeStats"][rTypes[i]][
              rKeys[j]
            ];
        }
      }
    }
  }

  if (rTotal["currentRankPoint"] == 0) {
    let obj = { tier: "Unranked", subTier: "1" };
    rTotal["currentTier"] = obj;
    rTotal["kda"] = 0;

    rTotal["avgDMG"] = 0;
    rTotal["winRatio"] = 0;
  } else {
    rTotal["kda"] = (
      (rTotal["kills"] + rTotal["assists"]) /
      rTotal["deaths"]
    ).toFixed(1);
    rTotal["avgDMG"] = (rTotal["damageDealt"] / rTotal["roundsPlayed"]).toFixed(
      1
    );
    rTotal["damageDealt"].toFixed(1);
    rTotal["winRatio"] =
      ((rTotal["wins"] / rTotal["roundsPlayed"]) * 100).toFixed(1) + "%";
  }
  let finalStat = {
    ranked: rTotal,
    normal: nTotal,
  };
  return finalStat;
}
const long = StyleSheet.create({
  sshD: {
    color: "rgb(241,249,88)",
    fontWeight: "bold",
    fontSize: responsiveFontSize(33),
    textAlign: "center",
    fontFamily: "WinnerSans-CompBold",
  },
  fshD: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(35),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  shD: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(25),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  lsh: {
    color: "black",
    fontSize: responsiveFontSize(35),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },

  lsh2: {
    color: "black",
    fontSize: responsiveFontSize(28),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },

  sh3: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(20),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
});
const run = StyleSheet.create({
  cCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: responsiveHeight(10),
  },
  con: {
    marginTop: responsiveHeight(10),
    padding: responsiveWidth(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lcon: {
    width: "50%",
    alignItems: "center",
    borderRightWidth: responsiveWidth(1),
    borderRightColor: "black",

    backgroundColor: "rgb(241,249,88)",
    borderRadius: responsiveWidth(10),
  },
  rcon: {
    width: "50%",
    alignItems: "center",
  },
  h: {
    borderBottomColor: "black",
    borderBottomWidth: responsiveHeight(1),
    width: "90%",
    paddingBottom: responsiveHeight(10),
    marginTop: responsiveHeight(10),
    justifyContent: "center", // 세로 중앙 정렬
    alignItems: "center", // 가로 중앙 정렬
  },

  hc: {
    width: "90%",
    paddingBottom: responsiveHeight(10),
    marginTop: responsiveHeight(10),
    justifyContent: "center", // 세로 중앙 정렬
    alignItems: "center", // 가로 중앙 정렬
  },
  lsh: {
    color: "black",
    fontSize: responsiveFontSize(35),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  lth: {
    textAlign: "center",
    color: "black",
    fontSize: responsiveFontSize(18),
    marginTop: responsiveHeight(3),
    fontFamily: "Pretendard-Regular",
  },
  lsh2: {
    color: "black",
    fontSize: responsiveFontSize(28),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  lth2: {
    textAlign: "center",

    fontSize: responsiveFontSize(16),
    marginTop: responsiveHeight(3),
  },
  h3: {
    width: "30%",

    justifyContent: "center",
    alignItems: "center",
  },
  sh3: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(18),
    textAlign: "center",
    fontWeight: "bold",
  },
  th3: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    marginTop: 3,
  },
});

const combat = StyleSheet.create({
  cCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: responsiveHeight(10),
  },
  con: {
    marginTop: responsiveHeight(10),
    padding: responsiveWidth(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lcon: {
    width: "50%",
    alignItems: "center",
    borderRightWidth: responsiveWidth(1),
    borderRightColor: "white",
  },
  rcon: {
    width: "50%",
    alignItems: "center",
  },
  h: {
    borderBottomColor: "white",
    borderBottomWidth: responsiveFontSize(1),
    width: "90%",
    paddingBottom: responsiveHeight(10),
    marginTop: responsiveHeight(10),
    justifyContent: "center", // 세로 중앙 정렬
    alignItems: "center", // 가로 중앙 정렬
  },

  sh: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(35),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  th: {
    textAlign: "center",
    fontFamily: "Pretendard-Regular",
    color: "white",
    fontSize: responsiveFontSize(18),
    marginTop: responsiveHeight(3),
  },
  sh2: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(28),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  th2: {
    textAlign: "center",
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(16),
    marginTop: responsiveHeight(3),
  },
  h3: {
    width: "30%",

    justifyContent: "center",
    alignItems: "center",
  },
  sh3: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(18),
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  th3: {
    textAlign: "center",
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(16),
    marginTop: responsiveHeight(3),
  },
});

const stats = StyleSheet.create({
  combatCon: {
    marginTop: responsiveHeight(10),
  },
  typeTitle: {
    color: "white",
    fontSize: responsiveFontSize(25),
    textAlign: "center",
    marginTop: responsiveHeight(10),
    fontFamily: "Pretendard-ExtraBold",
    fontWeight: "bold",
  },
  avgStatTitle: {
    height: "30%",
    justifyContent: "center",
    color: "white",
    fontSize: responsiveFontSize(12),
    padding: responsiveWidth(3),
    boxSizing: "border-box",
    fontFamily: "Pretendard-Regular",
  },

  avgStatText: {
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(20),
    height: "70%",
    flex: 1,
    boxSizing: "border-box",
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(10),
    fontFamily: "AgencyFB-Bold",
    paddingBottom: 0,
  },
  avgStatCon: {
    width: "33.3333%",
    borderLeftWidth: responsiveWidth(1),
    paddingLeft: responsiveWidth(3),
    borderColor: "white",
  },

  avgCon: {
    width: "65%",
    boxSizing: "border-box",
    backgroundColor: "#171717",
    height: responsiveHeight(155),
    borderTopRightRadius: responsiveWidth(10),
    borderBottomRightRadius: responsiveWidth(10),
    padding: responsiveWidth(10),
  },
  seasonCon: {
    backgroundColor: "#171717",
    width: "35%",
    boxSizing: "border-box",
    alignContent: "center",
    borderTopLeftRadius: responsiveWidth(10),
    borderBottomLeftRadius: responsiveWidth(10),
    padding: responsiveWidth(10),
    paddingLeft: responsiveWidth(18),
  },
  seasonNum: {
    color: "white",
    fontSize: responsiveFontSize(80),

    textAlign: "center",
    fontFamily: "PUBGBattlegrounds-Textured",
  },
  seasonTitle: {
    color: "white",
    fontSize: responsiveFontSize(25),
    textAlign: "center",
    fontFamily: "PUBGBattlegrounds-Textured",
    height: responsiveHeight(30),
    padding: 0,
  },
});

const rstats = StyleSheet.create({
  sh3: {
    color: "rgb(241,249,88)",
    fontSize: responsiveFontSize(15),
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
    fontFamily: "WinnerSans-CompBold",
  },
  h3: {
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
  },
  th3: {
    textAlign: "center",
    color: "black",
    fontSize: responsiveFontSize(15),
    marginTop: responsiveHeight(3),
  },
  rp: { width: "60%" },
  rpText: {
    paddingTop: responsiveHeight(2),
    color: "white",
    fontFamily: "AgencyFB-Bold",
    fontSize: responsiveFontSize(30),
  },
  rpPoint: {
    color: "white",
    fontFamily: "AgencyFB-Bold",
    fontSize: responsiveFontSize(20),
  },
  tierIMG: {
    resizeMode: "contain",
    width: "40%",
    height: responsiveHeight(70),
  },
  combatCon: {
    marginTop: responsiveHeight(10),
  },
  typeTitle: {
    color: "white",
    fontSize: responsiveFontSize(25),
    textAlign: "center",
    marginTop: responsiveHeight(10),
    fontFamily: "Pretendard-ExtraBold",
    fontWeight: "bold",
  },
  avgStatTitle: {
    height: "30%",
    justifyContent: "center",
    color: "white",
    fontSize: responsiveFontSize(12),
    padding: 0,

    boxSizing: "border-box",
    fontFamily: "Pretendard-Regular",
  },

  avgStatText: {
    color: "white",
    fontFamily: "Pretendard-Regular",
    fontSize: responsiveFontSize(20),
    height: "70%",
    flex: 1,
    boxSizing: "border-box",
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(10),
    fontFamily: "AgencyFB-Bold",
    paddingBottom: 0,
  },
  avgStatCon: {
    width: "33.3333%",
    borderLeftWidth: responsiveWidth(1),
    paddingLeft: responsiveWidth(3),

    borderColor: "white",
  },

  avgCon: {
    width: "65%",
    boxSizing: "border-box",
    backgroundColor: "#171717",

    borderTopRightRadius: responsiveWidth(10),
    borderBottomRightRadius: responsiveWidth(10),
    padding: responsiveWidth(10),
  },
  seasonCon: {
    backgroundColor: "#171717",
    width: "35%",
    boxSizing: "border-box",
    alignContent: "center",
    borderTopLeftRadius: responsiveWidth(10),
    borderBottomLeftRadius: responsiveWidth(10),
    padding: responsiveWidth(10),
    paddingLeft: responsiveWidth(18),
  },
  seasonNum: {
    color: "white",
    fontSize: responsiveFontSize(90),
    textAlign: "center",
    fontFamily: "PUBGBattlegrounds-Textured",
  },
  seasonTitle: {
    color: "white",
    fontSize: responsiveFontSize(30),
    textAlign: "center",
    fontFamily: "PUBGBattlegrounds-Textured",
    height: responsiveHeight(30),
    padding: 0,
  },
});

const styles = StyleSheet.create({
  dropdownContainer: {
    width: "80%",
    marginLeft: "10%",
    marginBottom: responsiveHeight(10),
    borderRadius: responsiveWidth(10),
  },

  container: {
    flexWrap: "wrap",
    flex: 1,
    padding: responsiveWidth(10),
    backgroundColor: "black",
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: responsiveWidth(10),
    marginBottom: responsiveHeight(10),
    justifyContent: "space-between",
  },
  button: {
    padding: responsiveWidth(10),
    margin: responsiveWidth(4),
    marginTop: 0,
    marginBottom: 0,
    width: "48%",
    backgroundColor: "black",
    borderRadius: responsiveWidth(5),
  },
  selectedButton: {
    backgroundColor: "rgb(241,249,88)",
  },
  deselectedButton: {
    backgroundColor: "black",
  },
  selectedButtonText: {
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: responsiveFontSize(18),
  },
  deselectedButtonText: {
    color: "rgb(241,249,88)",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: responsiveFontSize(18),
  },
  statText: {
    color: "white",
    fontFamily: "Pretendard-Regular",
  },
  error: {
    color: "red",
    fontSize: responsiveFontSize(16),
  },
});

export default PlayerStats;
