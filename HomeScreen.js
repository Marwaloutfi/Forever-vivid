import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Search, Bell, Plus, Film, BookOpen, Gift } from 'lucide-react-native';
import { collection, query, onSnapshot, serverTimestamp, addDoc } from 'firebase/firestore';
import { AppContext } from '../../App';
import { appId } from '../firebase/config';

// Composant Logo
const AppLogoSmall = () => (
  <View style={styles.logoContainer}>
    <Image 
      source={{ uri: 'https://placehold.co/24x24/6A4D9B/ffffff?text=FV' }} // Placeholder for your logo
      style={styles.logoImage} 
    />
    <Text style={styles.logoText}>FOREVER VIVID</Text>
    <Text style={styles.logoSlogan}>The memory boutique</Text>
  </View>
);

// Composant Avatar d'utilisateur
const UserAvatar = () => (
  <View style={styles.avatar}>
    <Image 
      source={{ uri: 'https://via.placeholder.com/40x40?text=User' }} 
      style={styles.avatarImage} 
    />
  </View>
);

// Composant Bouton d'action flottant "Add Memory"
const AddMemoryFAB = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.fab}
  >
    <Plus size={32} color="white" />
  </TouchableOpacity>
);


const HomeScreen = ({ navigation }) => {
  const { db, userId } = useContext(AppContext);
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetching Memories from Firestore
  useEffect(() => {
    if (!db || !userId) return;

    const userMemoriesPath = `artifacts/${appId}/users/${userId}/memories`;
    const memoriesQuery = query(collection(db, userMemoriesPath));

    const unsubscribe = onSnapshot(memoriesQuery, (snapshot) => {
        const fetchedMemories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure createdAt is a Date object for sorting/display
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(), 
            date: doc.data().date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            description: doc.data().description || 'Description par défaut',
            imageUrl: doc.data().imageUrl || 'https://via.placeholder.com/100x100?text=Mem',
            fullImageUrl: doc.data().fullImageUrl || 'https://via.placeholder.com/600x400?text=FullMem',
            tags: doc.data().tags || ['No', 'Tags'],
        }));
        
        fetchedMemories.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setMemories(fetchedMemories);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching memories:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId]);


  // 2. Action to add a new memory (upload simulation)
  const handleAddMemory = useCallback(async () => {
    if (!db || !userId) {
        alert("Erreur: Utilisateur non authentifié ou base de données non prête.");
        return;
    }

    const newMemory = {
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        description: `Nouvel upload à ${new Date().toLocaleTimeString('fr-FR')}`,
        imageUrl: `https://via.placeholder.com/100x100?text=NewMem`,
        fullImageUrl: `https://via.placeholder.com/600x400?text=Uploaded+Memoire+${memories.length + 1}`,
        tags: ['New', 'Draft'],
        hasMusic: false,
        createdAt: serverTimestamp(),
    };

    try {
        const userMemoriesPath = `artifacts/${appId}/users/${userId}/memories`;
        await addDoc(collection(db, userMemoriesPath), newMemory);
        console.log("Simulation: Souvenir ajouté avec succès à Firestore!");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
  }, [db, userId, memories.length]);


  // 3. Navigation Handlers
  const handleSelectMemory = (memory) => {
    navigation.navigate('Detail', { memory });
  };

  const handleContinueProject = () => {
    navigation.navigate('Projects');
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <UserAvatar />
          <View style={styles.searchContainer}>
            <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by people, date, place..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>
          <Bell size={24} color="#6B7280" />
        </View>

        {/* Featured Card */}
        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={handleContinueProject}
        >
          <View style={styles.featuredCardOverlay} />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTag}>Featured</Text>
            <Text style={styles.featuredTitle}>Continue your Memory Book / Film project</Text>
            <View style={styles.featuredDotsContainer}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.featuredDot} />
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {/* Memories List */}
        <View style={styles.memoriesList}>
            {isLoading ? (
                <ActivityIndicator size="small" color="#6A4D9B" style={{ marginTop: 20 }} />
            ) : memories.length === 0 ? (
                <Text style={styles.emptyText}>Aucun souvenir trouvé. Uploadez-en un avec le bouton +.</Text>
            ) : (
                memories.map((memory) => (
                    <TouchableOpacity
                        key={memory.id}
                        style={styles.memoryItem}
                        onPress={() => handleSelectMemory(memory)}
                    >
                        <Image
                            source={{ uri: memory.imageUrl }}
                            style={styles.memoryImage}
                            onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
                        />
                        <View style={styles.memoryTextContainer}>
                            <Text style={styles.memoryDate}>{memory.date}</Text>
                            <Text style={styles.memoryDescription} numberOfLines={1}>
                                {memory.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
      </ScrollView>
      <AddMemoryFAB onPress={handleAddMemory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, // Espace pour la barre de statut
    backgroundColor: '#F0EEEB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Espace pour le FAB
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  // UserAvatar styles
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1D5DB',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  // Search styles
  searchContainer: {
    flex: 1,
    marginHorizontal: 16,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    paddingVertical: 8,
    paddingLeft: 40,
    paddingRight: 16,
    backgroundColor: '#E5E7EB', // bg-gray-100
    borderRadius: 20,
    fontSize: 14,
    color: '#374151',
  },
  // Featured Card styles
  featuredCard: {
    backgroundColor: '#6A4D9B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  featuredCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  featuredContent: {
    position: 'relative',
    zIndex: 10,
  },
  featuredTag: {
    backgroundColor: '#A69B89',
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredDotsContainer: {
    flexDirection: 'row',
  },
  featuredDot: {
    width: 6,
    height: 6,
    backgroundColor: 'white',
    opacity: 0.5,
    borderRadius: 3,
    marginRight: 4,
  },
  // Memories List styles
  memoriesList: {
    marginBottom: 20,
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 12,
    marginBottom: 10,
  },
  memoryImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  memoryTextContainer: {
    flex: 1,
  },
  memoryDate: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
  },
  memoryDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937', // text-gray-800
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    fontSize: 14,
  },
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#6A4D9B',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default HomeScreen;