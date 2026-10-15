/** @format */

import { Image, StyleSheet, View } from "react-native";

import Logo from "@/assets/logo/logo.png";

export default function Brand() {
	return (
		<View style={styles.brand}>
			<Image source={Logo} style={styles.logo} />
		</View>
	);
}

const styles = StyleSheet.create({
	brand: {
		alignItems: "center",
		marginBottom: 16,
		gap: 8,
	},
	logo: {
		height: 80,
		width: 80,
	},
});
