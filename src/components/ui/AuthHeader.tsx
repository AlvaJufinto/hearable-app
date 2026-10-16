/** @format */

import { StyleSheet, View } from "react-native";

import { Colors, Fonts, FontSize, Radius, Spacing } from "@/constant/theme";
import { useHomeData } from "@/hooks/useHomeData";

import Brand from "./Brand";
import Text from "./Text";

export default function AuthHeader() {
	const { state } = useHomeData();

	const userName = state.status === "authenticated" ? state.userName : "User";

	return (
		<View style={styles.header}>
			<View style={styles.brandContainer}>
				<Brand width={40} height={40} />
				<Text style={styles.brandText}>HearAble</Text>
			</View>

			<View style={styles.avatar}>
				<Text style={styles.avatarText}>
					{userName.charAt(0).toUpperCase()}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		//paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
	},
	brandContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	brandText: {
		fontSize: FontSize.xl,
		fontFamily: Fonts.semiBold,
		color: Colors.primary,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: Radius.full,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		fontSize: FontSize.md,
		fontFamily: Fonts.semiBold,
		color: Colors.textOnPrimary,
	},
});
