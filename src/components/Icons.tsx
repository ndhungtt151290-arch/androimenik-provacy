import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { IconProps as IoniconsProps } from "@expo/vector-icons/Ionicons";

type IconName = IoniconsProps["name"];

interface IconProps {
  size?: number;
  color?: string;
}

export const FlagIcon: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="flag" size={size} color={color} />
);

export const ChevronLeft: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="chevron-back" size={size} color={color} />
);

export const ChevronRight: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="chevron-forward" size={size} color={color} />
);

export const Check: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="checkmark" size={size} color={color} />
);

export const X: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="close" size={size} color={color} />
);

export const Clock: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="time-outline" size={size} color={color} />
);

export const Home: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="home" size={size} color={color} />
);

export const BookOpen: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="book" size={size} color={color} />
);

export const Brain: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <MaterialCommunityIcons name="brain" size={size} color={color} />
);

export const Lightbulb: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="bulb" size={size} color={color} />
);

export const BarChart2: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="stats-chart" size={size} color={color} />
);

export const RotateCcw: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="refresh" size={size} color={color} />
);

export const ArrowLeft: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="arrow-back" size={size} color={color} />
);

export const ListOrdered: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="document-text" size={size} color={color} />
);

export const CircleAlert: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="alert-circle" size={size} color={color} />
);

export const BookMarked: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="bookmark" size={size} color={color} />
);

export const QuestionMark: React.FC<IconProps> = ({ size = 14, color = "#000" }) => (
  <Ionicons name="help-circle" size={size} color={color} />
);
