/** @format */

import React from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import Text from "@/components/ui/Text";
import { Colors, FontSize, Radius, Spacing } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

type ModuleCardMeta = {
	icon: string;
	label: string;
};

type ModuleCardProps = {
	title: string;
	description?: string;
	meta?: ModuleCardMeta[];
	difficulty?: number;
	onPress: () => void;
};

type ModuleIcon = keyof typeof Ionicons.glyphMap;

const DIFFICULTY_LABELS = ["", "Pemula", "Dasar", "Menengah", "Mahir"];

const DIFFICULTY_COLORS = [
	"",
	Colors.primary,
	Colors.primary,
	Colors.warning ?? Colors.primary,
	Colors.error ?? Colors.textSecondary,
];

function getModuleIcon(title: string, description?: string): ModuleIcon {
	const text = `${title} ${description ?? ""}`.toLowerCase();

	if (
		text.includes("speaking") ||
		text.includes("bicara") ||
		text.includes("ucapan") ||
		text.includes("kalimat") ||
		text.includes("pelafalan") ||
		text.includes("pengucapan")
	) {
		return "chatbox-ellipses-outline";
	}

	if (
		text.includes("listening") ||
		text.includes("hearing") ||
		text.includes("audio") ||
		text.includes("mendengar") ||
		text.includes("suara") ||
		text.includes("bunyi") ||
		text.includes("pendengaran")
	) {
		return "ear-outline";
	}

	return "book-outline";
}

function getModuleIconColor(title: string, description?: string): string {
	const text = `${title} ${description ?? ""}`.toLowerCase();

	if (
		text.includes("listening") ||
		text.includes("hearing") ||
		text.includes("audio") ||
		text.includes("mendengar") ||
		text.includes("suara") ||
		text.includes("bunyi") ||
		text.includes("pendengaran")
	) {
		return Colors.accent;
	}

	return Colors.primary;
}

function getMetaIcon(label: string): ModuleIcon {
	const text = label.toLowerCase();

	if (
		text.includes("audio") ||
		text.includes("detik") ||
		text.includes("menit")
	) {
		return "headset-outline";
	}

	if (
		text.includes("kalimat") ||
		text.includes("kata") ||
		text.includes("ucapan")
	) {
		return "chatbubble-outline";
	}

	if (
		text.includes("soal") ||
		text.includes("pertanyaan") ||
		text.includes("question")
	) {
		return "help-circle-outline";
	}

	if (
		text.includes("latihan") ||
		text.includes("sesi") ||
		text.includes("modul")
	) {
		return "layers-outline";
	}

	return "information-circle-outline";
}

export function ModuleCard({
	title,
	description,
	meta,
	difficulty,
	onPress,
}: ModuleCardProps) {
	const icon = getModuleIcon(title, description);
	const iconColor = getModuleIconColor(title, description);
	const iconBackground = `${iconColor}20`;

	const difficultyLevel =
		difficulty !== undefined &&
		Number.isInteger(difficulty) &&
		difficulty >= 1 &&
		difficulty < DIFFICULTY_LABELS.length
			? difficulty
			: undefined;

	const difficultyLabel =
		difficultyLevel !== undefined
			? DIFFICULTY_LABELS[difficultyLevel]
			: undefined;

	const difficultyColor =
		difficultyLevel !== undefined
			? DIFFICULTY_COLORS[difficultyLevel]
			: undefined;

	const showDifficulty = Boolean(difficultyLabel && difficultyColor);

	return (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.8}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={title}
		>
			<View style={styles.top}>
				<View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
					<Ionicons name={icon} size={22} color={iconColor} />
				</View>

				<View style={styles.info}>
					<Text style={styles.title}>{title}</Text>

					{description ? (
						<Text style={styles.description}>{description}</Text>
					) : null}
				</View>

				<View style={styles.chevron}>
					<Ionicons
						name="chevron-forward"
						size={18}
						color={Colors.textSecondary}
					/>
				</View>
			</View>

			{meta?.length || showDifficulty ? (
				<View style={styles.footer}>
					{meta?.map((item, index) => (
						<View key={`${item.label}-${index}`} style={styles.metaItem}>
							<Ionicons
								name={getMetaIcon(item.label)}
								size={14}
								color={Colors.textSecondary}
							/>
							<Text style={styles.metaText}>{item.label}</Text>
						</View>
					))}

					{showDifficulty && difficultyColor ? (
						<View
							style={[
								styles.badge,
								{
									borderColor: difficultyColor,
									backgroundColor: `${difficultyColor}15`,
								},
							]}
						>
							<Text style={[styles.badgeText, { color: difficultyColor }]}>
								{difficultyLabel}
							</Text>
						</View>
					) : null}
				</View>
			) : null}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Radius.xl,
		padding: Spacing.md,
		gap: Spacing.md,
		marginBottom: Spacing.md,
	},
	top: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: Radius.md,
		backgroundColor: Colors.primary + "15",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	info: {
		flex: 1,
	},
	title: {
		fontSize: FontSize.md,
		fontWeight: "700",
		color: Colors.text,
		marginBottom: 4,
	},
	description: {
		fontSize: FontSize.sm,
		color: Colors.textSecondary,
	},
	chevron: {
		width: 28,
		height: 28,
		borderRadius: Radius.full,
		backgroundColor: Colors.primary + "12",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		gap: Spacing.md,
		paddingTop: Spacing.md,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	metaText: {
		fontSize: FontSize.xs,
		color: Colors.textSecondary,
	},
	badge: {
		marginLeft: "auto",
		paddingHorizontal: Spacing.sm,
		paddingVertical: 4,
		borderWidth: 1,
		borderRadius: Radius.full,
	},
	badgeText: {
		fontSize: FontSize.xs,
		fontWeight: "600",
	},
});
