import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Radius } from "@/constant/theme";

type ProgressBarProps = {
	progress: number;
	trackColor?: string;
	fillColor?: string;
};

export function ProgressBar({
	progress,
	trackColor = Colors.surface,
	fillColor = Colors.primary,
}: ProgressBarProps) {
	return (
		<View style={styles.track}>
			<View
				style={[
					styles.fill,
					{
						width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
						backgroundColor: fillColor,
					},
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		height: 8,
		backgroundColor: Colors.surface,
		borderRadius: Radius.full,
		marginBottom: 24,
		overflow: "hidden",
	},
	fill: {
		height: "100%",
		borderRadius: Radius.full,
	},
});
