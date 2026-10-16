import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize, Radius } from "@/constant/theme";

type BadgeRowProps = {
	label: string;
	progressText?: string;
	badgeColor?: string;
	paddingTop?: number;
};

export function BadgeRow({
	label,
	progressText,
	badgeColor = Colors.primary,
	paddingTop,
}: BadgeRowProps) {
	return (
		<View style={[styles.row, paddingTop ? { paddingTop } : null]}>
			<View style={styles.badge}>
				<Text style={[styles.badgeText, { color: badgeColor }]}>{label}</Text>
			</View>
			{progressText && (
				<View style={styles.pill}>
					<Text style={styles.pillText}>{progressText}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	badgeText: {
		fontSize: FontSize.sm,
		fontWeight: "600",
		color: Colors.primary,
		letterSpacing: 0.14,
	},
	pill: {
		backgroundColor: Colors.surface,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: Radius.full,
	},
	pillText: {
		fontSize: FontSize.xs,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
});
