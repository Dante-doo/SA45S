// src/theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react'

// Configuração de modo de cor
const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

// Paleta inspirada em cartas de baralho (vermelho, preto e branco)
const colors = {
    red: {
        50:  '#ffe5e5',
        100: '#ffb3b3',
        200: '#ff8080',
        300: '#ff4d4d',
        400: '#ff1a1a',
        500: '#e60000',
        600: '#b40000',
        700: '#820000',
        800: '#500000',
        900: '#200000',
    },
    black: {
        50:  '#f2f2f2',
        100: '#d9d9d9',
        200: '#bfbfbf',
        300: '#a6a6a6',
        400: '#8c8c8c',
        500: '#737373',
        600: '#595959',
        700: '#404040',
        800: '#262626',
        900: '#0d0d0d',
    },
    white: {
        50: '#ffffff',
    },
}

// Tipografia padrão (pode manter Inter ou trocar)
const fonts = {
    heading: `'Inter', sans-serif`,
    body:    `'Inter', sans-serif`,
}

// Componentes customizados (opcional)
const components = {
    Button: {
        baseStyle: {
            fontWeight: 'bold',
            borderRadius: 'md',
        },
        variants: {
            solid: (props: any) => ({
                bg: props.colorMode === 'dark' ? 'white.50' : 'red.500',
                color: props.colorMode === 'dark' ? 'black.900' : 'white.50',
                _hover: {
                    bg: props.colorMode === 'dark' ? 'white.50' : 'red.600',
                },
            }),
        },
    },
}

// Cria e exporta o tema
const theme = extendTheme({
    config,
    colors,
    fonts,
    components,
})

export default theme
