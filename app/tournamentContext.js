// TournamentContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { getDocs, collection } from "firebase/firestore";
import initFirebase from "./firebase";
const { db } = initFirebase();

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const [tournamentsData, setTournamentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("TournamentProvider Mounted!"); // ✅ Provider가 정상적으로 렌더링되는지 확인
  }, []);
  // Firebase에서 토너먼트 데이터를 가져오는 함수
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const scheduleQuery = await getDocs(collection(db, "schedule"));
      if (!scheduleQuery.empty) {
        const scheduleData = [];
        scheduleQuery.forEach((doc) => {
          let matchDate = doc.data().startAt.slice(0, 10);
          scheduleData.push({
            id: doc.data().matchScheduleId,
            matchDate: matchDate,
            ...doc.data(),
          });
        });
        setTournamentsData(scheduleData);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <TournamentContext.Provider value={{ tournamentsData, loading }}>
      {children}
    </TournamentContext.Provider>
  );
};
export const useTournamentContext = () => {
  return useContext(TournamentContext);
};
export default TournamentContext;
