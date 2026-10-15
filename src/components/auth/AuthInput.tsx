/** @format */

import { useState } from "react";

import {
	Pressable,
	StyleSheet,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";
import Text from "@/components/ui/Text";

import { Colors } from "@/constant/theme";

type Props = TextInputProps & {
	label: string;
	hint?: string;
	password?: boolean;
};

export default function AuthInput({
	label,
	hint,
	password = false,
	secureTextEntry,
	...props
}: Props) {
	const [visible, setVisible] = useState(false);

	return (
		<View style={styles.field}>
			<View style={styles.labelRow}>
				<Text style={styles.label}>{label}</Text>
				{hint ? <Text style={styles.hint}>{hint}</Text> : null}
			</View>

			<View style={styles.inputContainer}>
				<TextInput
					{...props}
					style={styles.input}
					placeholderTextColor={Colors.disabled}
					secureTextEntry={password ? !visible : secureTextEntry}
					underlineColorAndroid="transparent"
					autoCapitalize={
						props.keyboardType === "email-address"
							? "none"
							: props.autoCapitalize
					}
				/>

				{password && (
					<Pressable
						onPress={() => setVisible((value) => !value)}
						style={styles.toggle}
						accessibilityRole="button"
						accessibilityLabel={
							visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
						}
					>
						<Text style={styles.toggleText}>
							{visible ? "Sembunyi" : "Lihat"}
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	field: {
		gap: 6,
		width: "100%",
	},
	labelRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		minHeight: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: Colors.text,
	},
	hint: {
		fontSize: 12,
		color: "#56615C",
	},
	inputContainer: {
		minHeight: 52,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.surface,
		borderRadius: 12,
		paddingHorizontal: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
	},
	input: {
		flex: 1,
		minWidth: 0,
		paddingVertical: 14,
		fontSize: 16,
		color: Colors.text,
	},
	toggle: {
		paddingLeft: 10,
		paddingVertical: 10,
	},
	toggleText: {
		color: Colors.primary,
		fontSize: 12,
		fontWeight: "600",
	},
});
