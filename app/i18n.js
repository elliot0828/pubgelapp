import * as Localization from "expo-localization";
import en from "../locales/en.json";
import ko from "../locales/ko.json";

// 언어별 텍스트 데이터
const translations = { en, ko };

// 현재 기기의 언어 가져오기
const deviceLocale = Localization.locale.split("-")[0];

// 언어 선택
const language = translations[deviceLocale] ? deviceLocale : "en"; // 기본값은 'en' (영어)

// 선택된 언어에 맞는 텍스트 데이터 가져오기
const strings = translations[language];
// 텍스트 데이터를 기본으로 export
export default strings;
