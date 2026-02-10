import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  mode: 'light',
  lightColors: {
    primary: '#E31E24',
    secondary: '#FFFFFF',
    black: '#333333',
  },
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
            backgroundColor: '#fff',
            borderColor: '#E0E0E0',
            borderWidth: 1,
          },
          titleStyle: {
            color: theme.colors.black,
          },
          activeStyle: {
            backgroundColor: theme.colors.primary,
          },
          disabledStyle: {
            backgroundColor: '#fff',
            borderColor: '#E0E0E0',
            opacity: 0.5,
          },
        };
      }

      if (props.type === 'clear') {
        return {
          buttonStyle: {
            ...baseStyle,
            backgroundColor: '#fff',
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
          color: theme.colors.secondary,
        },
        activeStyle: {
          backgroundColor: theme.colors.primary,
          opacity: 0.8,
        },
        disabledStyle: {
          backgroundColor: '#E0E0E0',
          opacity: 0.5,
        },
      };
    },
    Input: (props, theme) => ({
      inputStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        border: theme.colors.primary,
        height: 60,
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.primary,
        borderRadius: 100,
      },
    }),
    Icon: (props, theme) => ({
      iconProps: {
        color: theme.colors.primary,
      },
    }),
  },
});
