/** @format */

import { Text as NativeText, type TextProps } from "react-native";

import { Fonts } from "@/constant/theme";

export default function Text(props: TextProps) {
	return (
		<NativeText
			{...props}
			style={[{ fontFamily: Fonts.regular }, props.style]}
		/>
	);
}
