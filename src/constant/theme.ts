/** @format */

export const Colors = {
	primary: "#369FA6",
	secondary: "#89D1D9",
	tertiary: "#FCE289",
	accent: "#F2BB27",

	neutral: "#26352F",

	background: "#F8FAFA",
	surface: "#FFFFFF",

	text: "#26352F",
	textSecondary: "#64736B",
	textOnPrimary: "#FFFFFF",

	border: "#DCE8E8",
	disabled: "#B8D0D1",
	error: "#B42318",
	success: "#369FA6",
} as const;

export const Spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
} as const;

export const Radius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	full: 999,
} as const;

export const FontSize = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 18,
	xl: 24,
	xxl: 32,
} as const;

export const Fonts = {
	regular: "Poppins-Regular",
	medium: "Poppins-Medium",
	semiBold: "Poppins-SemiBold",
	bold: "Poppins-Bold",
} as const;
