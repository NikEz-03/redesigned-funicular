const palette = {
    primary: '#E04F5F',
    primaryLight: '#FCE4EC',
    primaryDark: '#AD1457',
    white: '#FFFFFF',
    black: '#000000',
    grey: '#757575',
    lightGrey: '#FAFAFA',
    darkGrey: '#121212',
    darkSurface: '#1E1E1E',
    borderLight: '#EEEEEE',
    borderDark: '#333333',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
};

export const themes = {
    light: {
        primary: palette.primary,
        primaryLight: palette.primaryLight,
        primaryDark: palette.primaryDark,
        background: palette.lightGrey,
        surface: palette.white,
        text: {
            primary: '#1A1A1A',
            secondary: palette.grey,
            inverse: palette.white,
        },
        border: palette.borderLight,
        status: {
            success: palette.success,
            warning: palette.warning,
            error: palette.error,
            info: palette.info,
        },
        cardShadow: palette.black,
        secondary: '#000000',
        white: palette.white,
        black: palette.black,
    },
    dark: {
        primary: palette.primary,
        primaryLight: '#3E1F25',
        primaryDark: '#FF80AB',
        background: palette.darkGrey,
        surface: palette.darkSurface,
        text: {
            primary: '#E0E0E0',
            secondary: '#B0B0B0',
            inverse: palette.white,
        },
        border: palette.borderDark,
        status: {
            success: '#81C784',
            warning: '#FFD54F',
            error: '#E57373',
            info: '#64B5F6',
        },
        cardShadow: palette.black,
        secondary: '#FFFFFF',
        white: palette.white,
        black: palette.black,
    },
};

export const colors = themes.light; // Default for backward compatibility
