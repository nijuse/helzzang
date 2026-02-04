import { config as defaultConfig } from '@gluestack-ui/config';

const inputFieldConfig = defaultConfig.components.InputField as any;

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      primary300: '#E0E0E0',
      // primary400: '#E31E24',
      primary500: '#E0E0E0',
      primary600: '#333',
      // primary700: '#333',
    },
  },
  components: {
    ...defaultConfig.components,
    Input: {
      ...defaultConfig.components.Input,
    },
    InputField: {
      ...defaultConfig.components.InputField,
      props: {
        ...inputFieldConfig.props,
        placeholderTextColor: '#333',
      },
    },
  },
};

export default config;
