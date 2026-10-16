/** @format */

import React from "react";

import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";

type ActionButtonVariant = "primary" | "secondary" | "retry";

type ActionButtonProps = {
	onPress: () => void;
	disabled?: boolean;
	variant?: ActionButtonVariant;
	children: React.ReactNode;
	style?: ViewStyle;
};

export function ActionButton({
	onPress,
	disabled = false,
	variant = "primary",
	children,
	style,
}: ActionButtonProps) {
	return (
		<TouchableOpacity
			style={[
				styles.base,
				(styles as any)[variant],
				disabled && (styles as any)[`${variant}Disabled`],
				style,
			]}
			activeOpacity={0.75}
			onPress={onPress}
			disabled={disabled}
			accessibilityRole="button"
		>
			{children}
		</TouchableOpacity>
	);
}

type ActionButtonTextProps = {
	children: React.ReactNode;
	variant?: ActionButtonVariant;
	disabled?: boolean;
};

export function ActionButtonText({
	children,
	variant = "primary",
	disabled = false,
}: ActionButtonTextProps) {
	return (
		<Text
			style={[
				styles.textBase,
				(styles as any)[`${variant}Text`],
				disabled && (styles as any)[`${variant}TextDisabled`],
			]}
		>
			{children}
		</Text>
	);
}

const styles = StyleSheet.create({
	base: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		minHeight: 52,
		paddingHorizontal: 24,
	},
	primary: {
		backgroundColor: Colors.primary,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		marginBottom: Spacing.sm,
	},
	primaryDisabled: {
		backgroundColor: Colors.secondary + "30",
	},
	primaryText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.surface,
	},
	primaryTextDisabled: {
		color: Colors.textSecondary,
	},
	secondary: {
		backgroundColor: Colors.surface,
		paddingVertical: Spacing.md,
		borderRadius: Radius.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	secondaryDisabled: {},
	secondaryText: {
		fontSize: FontSize.sm,
		fontWeight: "500",
		color: Colors.textSecondary,
	},
	secondaryTextDisabled: {},
	retry: {
		backgroundColor: Colors.primary,
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: Radius.md,
	},
	retryDisabled: {},
	retryText: {
		fontSize: FontSize.md,
		fontWeight: "600",
		color: Colors.surface,
	},
	retryTextDisabled: {},
	textBase: {
		fontSize: FontSize.md,
		fontWeight: "600",
	},
});
