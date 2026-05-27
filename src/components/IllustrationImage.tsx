import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

interface IllustrationImageProps {
  file?: string;
  style?: object;
  imageStyle?: object;
}

// Static map for Metro bundler static analysis
const imageMap: Record<string, ReturnType<typeof require>> = {
  "menkyogentsuki_1001.png": require("../assets/images/menkyogentsuki_1001.png"),
  "menkyogentsuki_1004.png": require("../assets/images/menkyogentsuki_1004.png"),
  "menkyogentsuki_1007.png": require("../assets/images/menkyogentsuki_1007.png"),
  "menkyogentsuki_1010.png": require("../assets/images/menkyogentsuki_1010.png"),
  "menkyogentsuki_1013.png": require("../assets/images/menkyogentsuki_1013.png"),
  "menkyogentsuki_1016.png": require("../assets/images/menkyogentsuki_1016.png"),
  "menkyogentsuki_1019.png": require("../assets/images/menkyogentsuki_1019.png"),
  "menkyogentsuki_1022.png": require("../assets/images/menkyogentsuki_1022.png"),
  "menkyogentsuki_1025.png": require("../assets/images/menkyogentsuki_1025.png"),
  "menkyogentsuki_1028.png": require("../assets/images/menkyogentsuki_1028.png"),
  "menkyogentsuki_1031.png": require("../assets/images/menkyogentsuki_1031.png"),
  "menkyogentsuki_1034.png": require("../assets/images/menkyogentsuki_1034.png"),
  "menkyogentsuki_1037.png": require("../assets/images/menkyogentsuki_1037.png"),
  "menkyogentsuki_1040.png": require("../assets/images/menkyogentsuki_1040.png"),
  "menkyogentsuki_1043.png": require("../assets/images/menkyogentsuki_1043.png"),
  "menkyogentsuki_1046.png": require("../assets/images/menkyogentsuki_1046.png"),
  "menkyogentsuki_1049.png": require("../assets/images/menkyogentsuki_1049.png"),
  "menkyogentsuki_1052.png": require("../assets/images/menkyogentsuki_1052.png"),
  "menkyogentsuki_1055.png": require("../assets/images/menkyogentsuki_1055.png"),
  "menkyogentsuki_1058.png": require("../assets/images/menkyogentsuki_1058.png"),
  "menkyogentsuki_1061.png": require("../assets/images/menkyogentsuki_1061.png"),
  "menkyogentsuki_1064.png": require("../assets/images/menkyogentsuki_1064.png"),
  "menkyogentsuki_1067.png": require("../assets/images/menkyogentsuki_1067.png"),
  "menkyogentsuki_1070.png": require("../assets/images/menkyogentsuki_1070.png"),
  "menkyogentsuki_1073.png": require("../assets/images/menkyogentsuki_1073.png"),
  "menkyogentsuki_1076.png": require("../assets/images/menkyogentsuki_1076.png"),
  "menkyogentsuki_1079.png": require("../assets/images/menkyogentsuki_1079.png"),
  "menkyogentsuki_1082.png": require("../assets/images/menkyogentsuki_1082.png"),
  "menkyogentsuki_1085.png": require("../assets/images/menkyogentsuki_1085.png"),
  "menkyogentsuki_1088.png": require("../assets/images/menkyogentsuki_1088.png"),
  "menkyogentsuki_1124.png": require("../assets/images/menkyogentsuki_1124.png"),
  "menkyogentsuki_1133.png": require("../assets/images/menkyogentsuki_1133.png"),
  "menkyogentsuki_1145.png": require("../assets/images/menkyogentsuki_1145.png"),
  "menkyogentsuki_1151.png": require("../assets/images/menkyogentsuki_1151.png"),
  "menkyogentsuki_1160.png": require("../assets/images/menkyogentsuki_1160.png"),
  "menkyogentsuki_1163.png": require("../assets/images/menkyogentsuki_1163.png"),
  "menkyogentsuki_1166.png": require("../assets/images/menkyogentsuki_1166.png"),
  "menkyogentsuki_1172.png": require("../assets/images/menkyogentsuki_1172.png"),
  "menkyogentsuki_1175.png": require("../assets/images/menkyogentsuki_1175.png"),
  "menkyogentsuki_1184.png": require("../assets/images/menkyogentsuki_1184.png"),
  "menkyogentsuki_1208.png": require("../assets/images/menkyogentsuki_1208.png"),
};

function resolveSrc(name: string | undefined) {
  if (!name) return null;
  return imageMap[name] ?? null;
}

export function IllustrationImage({
  file,
  style,
  imageStyle,
}: IllustrationImageProps) {
  const src = resolveSrc(file);

  if (!src) {
    return (
      <View style={[styles.placeholder, style as object]}>
        <Text style={styles.placeholderText}>HV</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style as object]}>
      <Image
        source={src}
        style={[styles.image, imageStyle as object]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor:"rgba(255, 255, 255, 0)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e5e5",
  },
  placeholderText: {
    fontSize: 10,
    color: "#a3a3a3",
  },
  image: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
});
