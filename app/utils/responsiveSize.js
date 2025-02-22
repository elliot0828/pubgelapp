import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// 기본 화면 너비와 높이를 기준으로 조정
const baseWidth = 375;
const baseHeight = 667;

export const responsiveWidth = (size) => (width / baseWidth) * size;
export const responsiveHeight = (size) => (height / baseHeight) * size;
export const responsiveFontSize = (size) =>
  PixelRatio.roundToNearestPixel((width / baseWidth) * size);

export default {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
};
