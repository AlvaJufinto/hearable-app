import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Radius } from "@/constant/theme";

type AudioVisualizerVariant = "wave" | "equalizer";

type AudioVisualizerProps = {
	variant?: AudioVisualizerVariant;
	heights?: number[];
	barColor?: string;
};

export function AudioVisualizer({
	variant = "equalizer",
	heights,
	barColor = Colors.primary,
}: AudioVisualizerProps) {
	const defaultHeights = variant === "wave" ? [12, 18, 14, 20, 16, 22, 14] : [8, 16, 24, 16, 8, 20, 12, 24, 16, 8];
	const barHeights = heights ?? defaultHeights;

	return (
		<View
			style={[
				styles.row,
				variant === "equalizer" && styles.equalizerRow,
			]}
		>
			{barHeights.map((height, i) => (
				<View
					key={i}
					style={[
						styles.bar,
						{
							height,
							backgroundColor: barColor,
							borderRadius: Radius.full,
						},
					]}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
	},
	equalizerRow: {
		alignItems: "flex-end",
		gap: 6,
		height: 40,
		marginBottom: 16,
	},
	bar: {
		width: 6,
	},
});
