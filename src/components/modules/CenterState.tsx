import React from "react";
import { View, StyleSheet } from "react-native";
import { Spacing } from "@/constant/theme";

type CenterStateProps = {
	flex?: boolean;
	children?: React.ReactNode;
};

export function CenterState({ flex = false, children }: CenterStateProps) {
	return (
		<View style={[styles.container, flex ? { flex: 1 } : null]}>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 80,
		gap: Spacing.md,
	},
});
