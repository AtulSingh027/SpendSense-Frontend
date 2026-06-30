import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface DonutSegment {
  percentage: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

/**
 * A pure SVG donut chart.
 * Pass `children` to render content in the center (e.g. total amount).
 */
export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 14,
  children,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Build cumulative rotation offsets for each arc segment
  let cumulativePercent = 0;
  const arcs = segments.map((seg) => {
    const startPercent = cumulativePercent;
    cumulativePercent += seg.percentage;
    return { ...seg, startPercent };
  });

  return (
    <View style={[chartStyles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#e5e2e1"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Colored segments */}
        <G transform={`rotate(-90 ${center} ${center})`}>
          {arcs.map((arc, i) => {
            const dashLength = (arc.percentage / 100) * circumference;
            const gapLength = circumference - dashLength;
            const offset = -((arc.startPercent / 100) * circumference);

            return (
              <Circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${gapLength}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
        </G>
      </Svg>

      {/* Center content overlay */}
      {children && (
        <View style={chartStyles.centerContent}>{children}</View>
      )}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerContent: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
