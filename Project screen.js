import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Plus, Gift, Film, BookOpen } from 'lucide-react-native';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { AppContext } from '../../App';
import { appId } from '../firebase/config';

// Composant Bouton d'action flottant "Start New Project"
const StartNewProjectFAB = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.fab}
  >
    <Plus size={24} color="white" />
    <Text style={styles.fabText}>Start New Project</Text>
  </TouchableOpacity>
);

// Composant de Carte de Projet (Livre)
const MemoryBookCard = ({ project }) => (
    <View style={styles.projectCard}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <View style={styles.bookContent}>
            <Image 
                source={{ uri: project.cover }} 
                style={styles.bookCover} 
                onError={() => console.error("Image not found")}
            />
            <View style={styles.bookDetails}>
                <View style={styles.imageGallery}>
                    {(project.images || []).slice(0, 4).map((img, i) => (
                      <Image 
                          key={i} 
                          source={{ uri: img }} 
                          style={styles.galleryImage} 
                          onError={() => console.error("Image not found")}
                      />
                    ))}
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${project.progress || 0}%` }]} />
                </View>
                <View style={styles.progressDetails}>
                    <Text style={styles.progressText}>{project.progress || 0}% Complete</Text>
                    <Text style={styles.progressText}>Last edited: {project.lastEdited || 'N/A'}</Text>
                </View>
            </View>
        </View>
    </View>
);

// Composant de Carte de Projet (Film/Gift)
const ProjectCard = ({ project }) => {
    let IconComponent;
    switch (project.type) {
        case 'film':
            IconComponent = Film;
            break;
        case 'gift':
            IconComponent = Gift;
            break;
        default:
            IconComponent = BookOpen;
    }

    return (
        <View style={styles.projectCard}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <View style={styles.otherProjectContent}>
                <Image 
                    source={{ uri: project.thumbnail }} 
                    style={styles.filmThumbnail} 
                    onError={() => console.error("Image not found")}
                />
                <View style={styles.otherProjectDetails}>
                    <Text style={styles.progressText}>Last edited: {project.lastEdited || 'N/A'}</Text>
                </View>
            </View>
        </View>
    );
};


const ProjectsScreen = ({ navigation }) => {
    const { db, userId } = useContext(AppContext);
    const [projects, setProjects] = useState({ memoryBooks: [], memoryFilms: [], printedGifts: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('memoryBooks');

    // 1. Fetching Projects from Firestore
    useEffect(() => {
        if (!db || !userId) return;

        const userProjectsPath = `artifacts/${appId}/users/${userId}/projects`;
        const projectsQuery = query(collection(db, userProjectsPath));

        const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
            const fetchedProjects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
                // Mock data fallback for missing fields
                progress: doc.data().progress || 0,
                lastEdited: doc.data().lastEdited || new Date().toLocaleDateString(),
                cover: doc.data().cover || 'https://via.placeholder.com/100x130?text=Book',
                thumbnail: doc.data().thumbnail || 'https://via.placeholder.com/180x100?text=Film',
            }));

            const categorizedProjects = {
                memoryBooks: fetchedProjects.filter(p => p.type === 'book'),
                memoryFilms: fetchedProjects.filter(p => p.type === 'film'),
                printedGifts: fetchedProjects.filter(p => p.type === 'gift'),
            };

            setProjects(categorizedProjects);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId]);


    // 2. Action to start a new project (simulation)
    const handleStartNewProject = useCallback(async () => {
        if (!db || !userId) {
            alert("Erreur: Utilisateur non authentifié ou base de données non prête.");
            return;
        }
        
        // Use a simple prompt for project type selection in a mobile environment simulation
        const projectType = 'book'; // Defaulting to book for simplicity; user would select via UI in real app

        const newProject = {
            type: projectType,
            title: `Nouveau Projet ${projectType.charAt(0).toUpperCase() + projectType.slice(1)} (${new Date().toLocaleDateString()})`,
            cover: 'https://via.placeholder.com/100x130?text=NewProject',
            thumbnail: 'https://via.placeholder.com/180x100?text=NewFilm',
            images: projectType === 'book' ? ['https://via.placeholder.com/60x60', 'https://via.placeholder.com/60x60'] : [],
            progress: 10,
            lastEdited: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            memoryIds: [],
            createdAt: serverTimestamp(),
        };

        try {
            const userProjectsPath = `artifacts/${appId}/users/${userId}/projects`;
            await addDoc(collection(db, userProjectsPath), newProject);
            console.log("Simulation: Nouveau projet créé avec succès!");
            setActiveTab(projectType === 'book' ? 'memoryBooks' : projectType === 'film' ? 'memoryFilms' : 'printedGifts');
        } catch (e) {
            console.error("Error creating project: ", e);
        }
    }, [db, userId]);

    // Render list based on tab
    const renderProjectList = () => {
        let currentProjects;
        let typeName;

        switch (activeTab) {
            case 'memoryBooks':
                currentProjects = projects.memoryBooks;
                typeName = 'Livre Souvenir';
                break;
            case 'memoryFilms':
                currentProjects = projects.memoryFilms;
                typeName = 'Film Souvenir';
                break;
            case 'printedGifts':
                currentProjects = projects.printedGifts;
                typeName = 'Objet Imprimé';
                break;
            default:
                return null;
        }

        if (isLoading) {
             return <ActivityIndicator size="large" color="#6A4D9B" style={{ marginTop: 50 }} />;
        }

        if (currentProjects.length === 0) {
            return (
                <Text style={styles.emptyText}>Aucun {typeName} trouvé. Commencez un nouveau projet !</Text>
            );
        }

        return (
            <View style={styles.listContainer}>
                {currentProjects.map((project) => (
                    <TouchableOpacity key={project.id} style={styles.projectItem}>
                        {project.type === 'book' ? (
                            <MemoryBookCard project={project} />
                        ) : (
                            <ProjectCard project={project} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Your Projects</Text>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TabButton 
                        title="Memory Books" 
                        isActive={activeTab === 'memoryBooks'} 
                        onPress={() => setActiveTab('memoryBooks')} 
                    />
                    <TabButton 
                        title="Memory Films" 
                        isActive={activeTab === 'memoryFilms'} 
                        onPress={() => setActiveTab('memoryFilms')} 
                    />
                    <TabButton 
                        title="Printed Gifts" 
                        isActive={activeTab === 'printedGifts'} 
                        onPress={() => setActiveTab('printedGifts')} 
                    />
                </View>

                {/* Project List */}
                {renderProjectList()}
            </ScrollView>
            <StartNewProjectFAB onPress={handleStartNewProject} />
        </View>
    );
};

// Composant Bouton d'Onglet (Tab)
const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity 
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={onPress}
    >
        <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0EEEB',
        paddingTop: 40,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Espace pour le FAB
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1F2937',
        marginBottom: 24,
    },
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#D1D5DB',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabButtonActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#6A4D9B',
    },
    tabButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    tabButtonTextActive: {
        color: '#6A4D9B',
    },
    // Project List
    listContainer: {
        gap: 16,
    },
    projectItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        padding: 16,
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 50,
        fontSize: 14,
    },
    // Book Card Specific
    bookContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bookCover: {
        width: 80,
        height: 100,
        borderRadius: 6,
        marginRight: 16,
        backgroundColor: '#E5E7EB',
    },
    bookDetails: {
        flex: 1,
    },
    imageGallery: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    galleryImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    progressBarContainer: {
        width: '100%',
        backgroundColor: '#E5E7EB',
        borderRadius: 5,
        height: 8,
        marginBottom: 4,
    },
    progressBar: {
        backgroundColor: '#6A4D9B',
        height: 8,
        borderRadius: 5,
    },
    progressDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 10,
        color: '#6B7280',
    },
    // Other Project Card Specific
    otherProjectContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filmThumbnail: {
        width: 120,
        height: 70,
        borderRadius: 6,
        marginRight: 16,
        backgroundColor: '#D1D5DB',
    },
    otherProjectDetails: {
        flex: 1,
    },
    // FAB styles
    fab: {
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: [{ translateX: -100 }], // Centre le bouton
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#6A4D9B',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    fabText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ProjectsScreen;