import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Edit, Share2, Download, Plus, Heart, MessageCircle, Bell, ArrowLeft } from 'lucide-react-native';

// Composant Logo (réutilisé)
const AppLogoSmall = () => (
  <View style={styles.logoContainer}>
    <Image 
      source={{ uri: 'https://placehold.co/24x24/6A4D9B/ffffff?text=FV' }} 
      style={styles.logoImage} 
    />
    <Text style={styles.logoText}>FOREVER VIVID</Text>
    <Text style={styles.logoSlogan}>The memory boutique</Text>
  </View>
);

const DetailScreen = ({ route, navigation }) => {
  const { memory } = route.params;

  const memoryDate = memory.createdAt instanceof Date 
    ? memory.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : memory.date;

  const handleAction = (action) => {
    // Dans une vraie app, ceci appellerait une fonction contextuelle
    console.log(`${action} action triggered for ${memory.id}`);
    if (action === 'Add to Project') {
        // Logique pour ajouter à un projet (simulation)
        navigation.navigate('Projects');
    }
  }

  return (
    <View style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Back Button and Logo */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#6A4D9B" />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <AppLogoSmall />
        </View>

        <Text style={styles.headerText}>Memory Detail Page</Text>

        {/* Polaroid style image */}
        <View style={styles.polaroidCard}>
          <Image
            source={{ uri: memory.fullImageUrl }}
            style={styles.detailImage}
            onError={() => console.error("Image not found")}
          />
          {memory.hasMusic && (
            <View style={styles.musicIcon}>
              <Bell size={16} color="white" />
            </View>
          )}
        </View>

        <Text style={styles.questionText}>What makes this memory so vivid?</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <Text style={styles.dateTag}>{memoryDate}</Text>
          {(memory.tags || []).map((tag, index) => (
            <Text key={index} style={styles.tag}>{tag}</Text>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <ActionButton icon={Edit} text="Edit" onPress={() => handleAction('Edit')} />
          <ActionButton icon={Plus} text="Add to Project" onPress={() => handleAction('Add to Project')} />
          <ActionButton icon={Share2} text="Share" onPress={() => handleAction('Share')} />
          <ActionButton icon={Download} text="Export" onPress={() => handleAction('Export')} />
        </View>

        {/* Social engagement (mock) */}
        <View style={styles.socialContainer}>
          <View style={styles.socialItem}>
            <Heart size={20} color="#6B7280" />
            <Text style={styles.socialCount}>12</Text>
          </View>
          <View style={styles.socialItem}>
            <MessageCircle size={20} color="#6B7280" />
            <Text style={styles.socialCount}>3</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Composant Bouton d'Action Réutilisable
const ActionButton = ({ icon: Icon, text, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Icon size={16} color="#4B5563" />
    <Text style={styles.actionButtonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F0EEEB',
    paddingTop: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 5,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoImage: { height: 24, width: 24, marginBottom: 4 },
  logoText: { fontSize: 10, fontWeight: '600', color: '#6A4D9B' },
  logoSlogan: { fontSize: 8, color: '#A69B89' },

  headerText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 30,
  },
  // Polaroid Card
  polaroidCard: {
    backgroundColor: 'white',
    padding: 8,
    paddingBottom: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
    maxWidth: 350,
    alignSelf: 'center',
  },
  detailImage: {
    width: '100%',
    aspectRatio: 1.5, // 600x400 ratio
    borderRadius: 6,
  },
  musicIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 20,
  },
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
  },
  tag: {
    backgroundColor: '#6A4D9B',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dateTag: {
    backgroundColor: '#A69B89',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
    maxWidth: 380,
    alignSelf: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    // flexBasis: '45%', // Utilisation de flexBasis pour un wrap sur deux colonnes
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563', // text-gray-700
  },
  // Social
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialCount: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default DetailScreen;