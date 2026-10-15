/** @format */

import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import Text from "@/components/ui/Text";

import { Colors } from "@/constant/theme";

type Props = {
	title: string;
	onPress: () => void;
	loading?: boolean;
	disabled?: boolean;
};

export default function AuthButton({
	title,
	onPress,
	loading = false,
	disabled = false,
}: Props) {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || loading}
			accessibilityRole="button"
			style={({ pressed }) => [
				styles.button,
				pressed && styles.pressed,
				(disabled || loading) && styles.disabled,
			]}
		>
			{loading ? (
				<ActivityIndicator color={Colors.textOnPrimary} />
			) : (
				<Text style={styles.text}>{title} →</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		width: "100%",
		height: 52,
		backgroundColor: Colors.primary,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 16,
	},
	text: {
		color: Colors.textOnPrimary,
		fontSize: 16,
		fontWeight: "600",
	},
	pressed: {
		opacity: 0.85,
	},
	disabled: {
		opacity: 0.6,
	},
});
