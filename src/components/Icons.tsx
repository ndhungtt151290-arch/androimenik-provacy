import React from "react";
import { Text } from "react-native";

interface IconProps {
  size?: number;
  className?: string;
}

export const FlagIcon: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>🚩</Text>
);

export const ChevronLeft: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size + 4 }}>‹</Text>
);

export const ChevronRight: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size + 4 }}>›</Text>
);

export const Check: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>✓</Text>
);

export const X: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>✗</Text>
);

export const Clock: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>⏱</Text>
);

export const Home: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>🏠</Text>
);

export const BookOpen: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>📖</Text>
);

export const Brain: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>🧠</Text>
);

export const Lightbulb: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>💡</Text>
);

export const BarChart2: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>📊</Text>
);

export const RotateCcw: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>↺</Text>
);

export const ArrowLeft: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>←</Text>
);

export const ListOrdered: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>📋</Text>
);

export const CircleAlert: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>⚠</Text>
);

export const BookMarked: React.FC<IconProps> = ({ size = 14 }) => (
  <Text style={{ fontSize: size }}>📌</Text>
);
