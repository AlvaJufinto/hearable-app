/** @format */

import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

const features = [
	{
		icon: "refresh" as const,
		iconColor: "#32939B",
		iconBg: "#EAF6F8",
		title: "Ritme Fleksibel",
		description:
			"Ulangi kata dan pola visual sesering yang kamu butuhkan tanpa batas waktu.",
	},
	{
		icon: "happy-outline" as const,
		iconColor: "#4A3F10",
		iconBg: "#FCE596",
		title: "Lingkungan Nyaman",
		description:
			"Ruang aman untuk bereksplorasi artikulasi tanpa rasa cemas dinilai.",
	},
];

export default function Step1Screen() {
	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<View style={styles.container}>
				<View style={styles.stepIndicator}>
					<Text style={styles.stepText}>Langkah 1 dari 3</Text>

					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: "33%" }]} />
					</View>
				</View>

				<View style={styles.content}>
					<Text style={styles.title}>Belajar dengan Caramu</Text>

					<Text style={styles.description}>
						Latihan mandiri dirancang agar kamu bisa berlatih bicara dan
						mendengarkan kapan saja dan dimana saja.
					</Text>

					<View style={styles.cards}>
						{features.map((f, i) => (
							<View key={i} style={styles.card}>
								<View
									style={[styles.cardIconWrap, { backgroundColor: f.iconBg }]}
								>
									<Ionicons name={f.icon} size={24} color={f.iconColor} />
								</View>

								<View style={styles.cardTextContainer}>
									<Text style={styles.cardTitle}>{f.title}</Text>
									<Text style={styles.cardDesc}>{f.description}</Text>
								</View>
							</View>
						))}
					</View>
				</View>

				<View style={styles.actions}>
					<TouchableOpacity
						style={styles.primaryButton}
						activeOpacity={0.8}
						onPress={() => router.push("/onboarding/step-2")}
					>
						<Text style={styles.primaryButtonText}>Lanjut</Text>
						<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#EEF7F8",
	},
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	stepIndicator: {
		paddingTop: 24,
		marginBottom: 32,
	},
	stepText: {
		fontSize: 14,
		color: "#666666",
		marginBottom: 12,
	},
	progressBar: {
		height: 6,
		backgroundColor: "#D8EAEB",
		borderRadius: 8,
	},
	progressFill: {
		height: 6,
		backgroundColor: "#32939B",
		borderRadius: 8,
	},
	content: {
		flex: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: "800",
		color: "#1A1A1A",
		marginBottom: 12,
	},
	description: {
		fontSize: 16,
		color: "#666666",
		lineHeight: 24,
		marginBottom: 32,
	},
	cards: {
		gap: 16,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 20,
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 16,
	},
	cardIconWrap: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	cardTextContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1A1A1A",
		marginBottom: 6,
	},
	cardDesc: {
		fontSize: 14,
		color: "#666666",
		lineHeight: 22,
	},
	actions: {
		paddingBottom: 32,
	},
	primaryButton: {
		backgroundColor: "#32939B",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 8,
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "700",
	},
});
