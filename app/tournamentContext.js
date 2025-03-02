// // TournamentContext.js
// import React, { createContext, useState, useEffect, useContext } from "react";
// import { getDocs, collection } from "firebase/firestore";
// import initFirebase from "./firebase";
// const { db } = initFirebase();

// const TournamentContext = createContext();

// export const TournamentProvider = ({ children }) => {
//   const [tournamentsData, setTournamentsData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Firebase에서 토너먼트 데이터를 가져오는 함수
//   const fetchTournaments = async () => {
//     try {
//       setLoading(true);
//       const scheduleQuery = await getDocs(collection(db, "schedule"));
//       if (!scheduleQuery.empty) {
//         const scheduleData = [];
//         scheduleQuery.forEach((doc) => {
//           let matchDate = doc.data().startAt.slice(0, 10);
//           console.log(matchDate);
//           scheduleData.push({
//             id: doc.data().matchScheduleId,
//             matchDate: matchDate,
//             ...doc.data(),
//           });
//         });
//         console.log(scheduleData[10]);
//         setTournamentsData(scheduleData);
//       }
//     } catch (error) {
//       console.error("Error fetching tournaments:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTournaments();
//   }, []);

//   return (
//     <TournamentContext.Provider value={{ tournamentsData, loading }}>
//       {children}
//     </TournamentContext.Provider>
//   );
// };
// export const useTournamentContext = () => {
//   return useContext(TournamentContext);
// };
// export default TournamentContext;
import React, { createContext, useState, useEffect, useContext } from "react";
import { getDocs, collection } from "firebase/firestore";
import initFirebase from "./firebase";

const { db } = initFirebase();

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
  const [tournamentsData, setTournamentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 클라이언트 로컬 시간 변환 함수
  const convertToClientTime = (utcDateString) => {
    if (!utcDateString) return ""; // 예외 처리

    const localDate = new Date(utcDateString.toLocaleString()); // 로컬 시간대로 변환

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`; // 기존 형식 유지
  };

  // Firebase에서 토너먼트 데이터를 가져오는 함수
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const scheduleQuery = await getDocs(collection(db, "schedule"));
      if (!scheduleQuery.empty) {
        const scheduleData = [];
        scheduleQuery.forEach((doc) => {
          // 클라이언트 시간으로 변환
          const startAt = convertToClientTime(doc.data().startAt);
          const liveStartAt = convertToClientTime(doc.data().liveStartAt);
          const liveEndAt = convertToClientTime(doc.data().liveEndAt);

          let matchDate = startAt.slice(0, 10); // 날짜만 추출 (YYYY-MM-DD)
          // console.log(startAt, liveStartAt, liveEndAt, matchDate);
          // 각 데이터에 변환된 시간을 포함
          scheduleData.push({
            id: doc.data().matchScheduleId,
            matchDate: matchDate,
            startAt: startAt,
            liveStartAt: liveStartAt,
            liveEndAt: liveEndAt,
            ...doc.data(),
          });
        });
        // console.log(scheduleData[10]);
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
