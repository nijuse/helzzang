import { createTheme } from '@rneui/themed';

export const colors = {
  primary: '#E31E24',
  white: '#FFFFFF',
  black: '#333333',
  grey0: '#666666',
  greyOutline: '#E0E0E0',
} as const;

const theme = createTheme({
  mode: 'light',
  lightColors: colors,
  components: {
    Button: (props, theme) => {
      // type별 기본 스타일 설정
      const baseStyle = {
        borderRadius: 100,
        paddingHorizontal: 20,
        paddingVertical: 10,
      };
      // type에 따라 다른 스타일 적용
      if (props.type === 'outline') {
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.greyOutline,
            borderWidth: 1,
          },
          titleStyle: {
            color: theme.colors.black,
          },
          activeStyle: {
            backgroundColor: theme.colors.primary,
          },
          disabledStyle: {
            backgroundColor: theme.colors.white,
            borderColor: theme.colors.greyOutline,
            opacity: 0.5,
          },
        };
      }

      if (props.type === 'clear') {
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: theme.colors.white,
          },
          titleStyle: {
            color: theme.colors.primary,
          },
          activeStyle: {
            backgroundColor: '#F5F5F5',
          },
        };
      }
      // 'solid' 타입 (기본값)
      return {
        buttonStyle: {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
        },
        titleStyle: {
          color: theme.colors.white,
        },
        activeStyle: {
          backgroundColor: theme.colors.primary,
          opacity: 0.8,
        },
        disabledStyle: {
          backgroundColor: theme.colors.greyOutline,
          opacity: 0.5,
        },
      };
    },
    Input: (props, theme) => ({
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.greyOutline,
        borderRadius: 10,
      },
    }),
    // Icon: (props, theme) => ({
    //   iconProps: {
    //     color: theme.colors.primary,
    //   },
    // }),
  },
});

export default theme;
