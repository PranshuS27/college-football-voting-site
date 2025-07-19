import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { AuthProvider } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      900: '#0d47a1',
    },
  },
  fonts: {
    heading: 'Oswald, Impact, system-ui, sans-serif',
    body: 'Roboto, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Navbar />
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  )
}
