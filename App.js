import { registerRootComponent } from 'expo';
import App from '.expo'; // Importe votre composant principal App

// Ceci indique à Expo quel composant doit être rendu au démarrage
registerRootComponent(App);import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import App, { registerRootComponent } from 'expo';
import { auth, db, initialAuthToken } from './src/firebase/config';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
const Stack = createNativeStackNavigator();

// Context pour le stockage global de l'utilisateur et de la base de données
export const AppContext = React.createContext();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6A4D9B" />
    <Text style={styles.loadingText}>Authentification en cours...</Text>
  </View>
);

function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 1. Gestion de l'Authentification
  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        // Tente de se connecter anonymement si pas de jeton
        if (!initialAuthToken) {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.error("Anonymous sign-in failed:", e);
          }
        }
      }
      setIsAuthReady(true);
    });

    // Tente de se connecter avec le jeton personnalisé
    if (initialAuthToken) {
        signInWithCustomToken(auth, initialAuthToken).catch(e => console.error("Custom token sign-in failed:", e));
    }

    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return <LoadingScreen />;
  }

  // Fournit les instances db et userId via le contexte
  const contextValue = {
    db,
    userId,
    // Note: Ajoutez ici les fonctions de manipulation de données (addMemory, etc.)
  };

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // Cache la barre de navigation par défaut
            contentStyle: { backgroundColor: '#F0EEEB' }, // Couleur de fond
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Projects" component={ProjectsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EEEB',
  },
  loadingText: {
    marginTop: 10,
    color: '#6A4D9B',
    fontSize: 16,
  },
});

export default App;