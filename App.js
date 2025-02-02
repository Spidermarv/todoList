import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  Switch,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { PaperProvider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Menu } from 'react-native-paper';

// Update the color constants at the top of the file
const Colors = {
  light: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    secondaryText: '#6C6C70',
    tint: '#007AFF',
    separator: '#E5E5EA',
    danger: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    cardBackground: '#FFFFFF',
    modalBackground: '#FFFFFF',
    inputBackground: '#F2F2F7',
    statusComplete: '#34C759',    // iOS green
    statusInProgress: '#FF9500',  // iOS orange
    statusCancelled: '#FF3B30',   // iOS red
  },
  dark: {
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    secondaryText: '#8E8E93',
    tint: '#0A84FF',
    separator: '#38383A',
    danger: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    cardBackground: '#2C2C2E',
    modalBackground: '#2C2C2E',
    inputBackground: '#1C1C1E',
    statusComplete: '#32D74B',    // iOS dark mode green
    statusInProgress: '#FF9F0A',  // iOS dark mode orange
    statusCancelled: '#FF453A',   // iOS dark mode red
  }
};

// First, move styles outside the component
const getStyles = (isDarkMode) => {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: 'transparent',
      zIndex: 1000,
    },
    header: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      textAlign: 'left',
      paddingLeft: 4,
    },
    emptyText: { textAlign: 'center', color: '#6c757d' },
    taskCard: {
      marginHorizontal: 16,
      marginVertical: 6,
      padding: 16,
      backgroundColor: isDarkMode ? 'rgba(44, 44, 48, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 16,
      shadowColor: isDarkMode ? '#000' : '#999',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDarkMode ? 0.25 : 0.15,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: isDarkMode ? 0.5 : 0,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    },
    taskTitleContainer: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    taskDate: {
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: 8,
    },
    taskDescription: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 8,
    },
    taskStatus: {
      fontSize: 14,
      fontWeight: '600',
      marginVertical: 5,
      color: colors.text,
    },
    taskStatusComplete: {
      color: colors.statusComplete,
    },
    taskStatusInProgress: {
      color: colors.statusInProgress,
    },
    taskStatusCancelled: {
      color: colors.statusCancelled,
    },
    taskActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    statusChangeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.tint,
    },
    statusChangeButtonText: { color: '#fff', fontWeight: 'bold' },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.danger + '10',
      borderWidth: 1,
      borderColor: colors.danger + '30',
    },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: {
      width: '90%',
      padding: 20,
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      maxHeight: '80%',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: isDarkMode ? 0.4 : 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    modalHeader: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 20,
      color: colors.text,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      color: colors.text,
      fontSize: 16,
    },
    dateButton: {
      backgroundColor: colors.inputBackground,
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    dateButtonText: {
      color: colors.text,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: 'transparent',
      padding: 15,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: Colors.light.success,
      shadowColor: Colors.light.success,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    addButtonText: {
      color: Colors.light.success,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 16,
    },
    closeButton: { color: '#dc3545', textAlign: 'center', fontSize: 16 },
    floatingButton: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      backgroundColor: colors.tint,
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      transform: [{ scale: 0.9 }],
    },
    floatingButtonText: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    darkMode: { backgroundColor: '#333' },
    locationButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, marginVertical: 5 },
    buttonText: { color: '#fff', textAlign: 'center' },
    map: { height: 200, marginVertical: 10, borderRadius: 10 },
    attachmentButton: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.separator,
      marginVertical: 8,
    },
    attachmentButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachmentButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: colors.tint,
    },
    attachmentPreviewContainer: {
      marginVertical: 8,
    },
    attachmentPreviewWrapper: {
      width: 80,
      height: 80,
      marginRight: 8,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.separator,
    },
    attachmentPreviewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    removeAttachmentButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: 4,
    },
    menuIcon: {
      fontSize: 24,
      color: '#007AFF',
    },
    darkContainer: {
      backgroundColor: '#121212',
    },
    darkText: {
      color: '#fff',
    },
    darkTaskCard: {
      backgroundColor: '#2d2d2d',
    },
    locationText: {
      fontSize: 14,
      color: '#666',
      marginVertical: 5,
    },
    attachmentsContainer: {
      marginVertical: 5,
    },
    previewContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewContent: {
      width: '90%',
      height: '80%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    previewHeader: {
      height: 44,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#3E3E3E' : '#E5E5EA',
    },
    previewCloseButton: {
      padding: 8,
    },
    previewCloseText: {
      fontSize: 17,
      fontWeight: '600',
    },
    previewImage: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    previewMap: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    mapToggleButton: {
      backgroundColor: '#6c757d',
      padding: 10,
      borderRadius: 5,
      marginVertical: 5,
    },
    importanceIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    importanceBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 8,
      borderWidth: 1,
    },
    highImportance: {
      backgroundColor: colors.danger + '10',
      borderColor: colors.danger + '30',
    },
    mediumImportance: {
      backgroundColor: colors.warning + '10',
      borderColor: colors.warning + '30',
    },
    lowImportance: {
      backgroundColor: colors.success + '10',
      borderColor: colors.success + '30',
    },
    importanceText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? colors.text : colors.secondaryText,
    },
    expandedContent: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.separator,
      gap: 12,
    },
    statusSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
    },
    statusBadgeComplete: {
      backgroundColor: colors.success + '20',
    },
    statusBadgeInProgress: {
      backgroundColor: colors.warning + '20',
    },
    statusBadgeCancelled: {
      backgroundColor: colors.danger + '20',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    previewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.separator,
    },
    previewButtonText: {
      marginLeft: 8,
      fontSize: 15,
      color: colors.tint,
      fontWeight: '500',
    },
    attachmentPreview: {
      width: 80,
      height: 80,
      marginRight: 8,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.separator,
    },
    attachmentThumbnail: {
      width: '100%',
      height: '100%',
    },
    actionButton: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.tint,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    completedTaskCard: {
      shadowColor: isDarkMode ? Colors.dark.success : Colors.light.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
      borderColor: isDarkMode ? 
        `${Colors.dark.success}30` : 
        `${Colors.light.success}20`,
      borderWidth: 0.5,
    },
    inProgressTaskCard: {
      shadowColor: Colors.light.warning,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      borderColor: Colors.light.warning + '30',
    },
    cancelledTaskCard: {
      shadowColor: Colors.light.danger,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      borderColor: Colors.light.danger + '30',
    },
    darkButton: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.separator,
    },
    datePickerContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: colors.separator,
    },
    datePickerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.separator,
      padding: 8,
    },
    datePickerButton: {
      padding: 8,
      minWidth: 80,
      alignItems: 'center',
      borderRadius: 8,
    },
    datePickerButtonText: {
      color: colors.tint,
      fontSize: 17,
      fontWeight: '600',
    },
    datePickerButtonConfirm: {
      backgroundColor: colors.tint,
    },
    datePickerButtonTextConfirm: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
    },
    importanceButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    importanceButton: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      alignItems: 'center',
    },
    importanceButtonSelected: {
      borderColor: colors.tint,
      backgroundColor: isDarkMode ? colors.cardBackground : '#F5F5F5',
    },
    importanceButtonText: {
      color: Colors.light.text,
      fontSize: 16,
    },
    importanceButtonTextSelected: {
      color: colors.tint,
    },
    darkImportanceButton: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.separator,
    },
    locationSection: {
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.secondaryText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    mapContainer: {
      height: 200,
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 8,
    },
    currentLocationButton: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    buttonIcon: {
      fontSize: 20,
    },
    themeButton: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: isDarkMode ? 'rgba(45, 45, 50, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      shadowColor: isDarkMode ? '#000' : '#999',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
      zIndex: 1000,
      borderWidth: 0.5,
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      position: 'absolute',
      top: 50,
      right: 20,
      backdropFilter: 'blur(10px)',
    },
    importanceSection: {
      marginBottom: 24,
    },
  });
};

// Add this near the top of the file, after imports
const getImportanceColor = (importance) => {
  switch (importance) {
    case 'high':
      return Colors.light.danger;
    case 'medium':
      return Colors.light.warning;
    case 'low':
      return Colors.light.success;
    default:
      return Colors.light.tint;
  }
};

// Add this near the top of the file, after imports
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Add this theme configuration before the TaskManager component
const CustomTheme = {
  light: {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: Colors.light.tint,
      surface: '#2C2C2E',
      onSurface: '#FFFFFF',
      backdrop: 'transparent',
    },
  },
  dark: {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.dark.tint,
      surface: '#1C1C1E',
      onSurface: '#FFFFFF',
      backdrop: 'transparent',
    },
  },
};

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [taskLogs, setTaskLogs] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [theme, setTheme] = useState('light');
  const colorScheme = useColorScheme();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [offlineTasks, setOfflineTasks] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLocation, setPreviewLocation] = useState(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [importance, setImportance] = useState('medium'); // 'low', 'medium', 'high'
  const [tempDate, setTempDate] = useState(new Date());

  // Add this line to get the current theme colors
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const styles = getStyles(isDarkMode);

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    };
    loadTasks();
  }, []);

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert('Permission needed', 'Push notifications are required for reminders');
          return;
        }
      } catch (error) {
        console.log('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  // Schedule notification for task
  const scheduleNotification = async (taskTitle, dueDate) => {
    const trigger = new Date(dueDate);
    trigger.setMinutes(trigger.getMinutes() - 30);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Task',
        body: `Task "${taskTitle}" is due in 30 minutes`,
      },
      trigger: {
        type: 'date',
        timestamp: trigger.getTime(),
      },
    });
  };

  // Add log entry
  const addLogEntry = async (action, taskId) => {
    const newLog = {
      id: Math.random().toString(),
      action,
      taskId,
      timestamp: new Date().toISOString(),
    };
    const updatedLogs = [...taskLogs, newLog];
    setTaskLogs(updatedLogs);
    await AsyncStorage.setItem('taskLogs', JSON.stringify(updatedLogs));
  };

  // Pick image attachment
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add attachments.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newAttachments = result.assets.map(asset => asset.uri);
        setAttachments(prevAttachments => [...prevAttachments, ...newAttachments]);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permission is required');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setSelectedLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  // Add this near the top of the component
  useEffect(() => {
    // Set up network status listener
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncOfflineTasks();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Add this function to handle syncing
  const syncOfflineTasks = async () => {
    try {
      // Get stored offline tasks
      const storedOfflineTasks = await AsyncStorage.getItem('offlineTasks');
      if (storedOfflineTasks) {
        const tasksToSync = JSON.parse(storedOfflineTasks);
        
        // Here you would typically send these to your backend
        // For now, we'll just merge them with existing tasks
        const updatedTasks = [...tasks, ...tasksToSync];
        setTasks(updatedTasks);
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Clear offline tasks
        setOfflineTasks([]);
        await AsyncStorage.removeItem('offlineTasks');
      }
    } catch (error) {
      console.log('Error syncing offline tasks:', error);
    }
  };

  // Update the addTask function
  const addTask = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all required fields!');
      return;
    }

    const newTask = {
      id: Math.random().toString(),
      title,
      description,
      date: date.toISOString(),
      status: 'in-progress',
      location: selectedLocation,
      attachments: attachments,
      importance,
      createdAt: new Date().toISOString(),
      pendingSync: false
    };

    // Check network status
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      newTask.pendingSync = true;
      setOfflineTasks(prev => [...prev, newTask]);
      await AsyncStorage.setItem('offlineTasks', JSON.stringify([...offlineTasks, newTask]));
    }

    // Always save locally
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    await scheduleNotification(title, date);
    await addLogEntry('Task Created', newTask.id);

    setModalVisible(false);
    clearInputs();
  };

  // Clear inputs (modified)
  const clearInputs = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setSelectedLocation(null);
    setAttachments([]);
    setImportance('medium');
  };

  // Toggle task status
  const toggleStatus = (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        task.status = newStatus;
      }
      return task;
    });
    setTasks(updatedTasks);
    AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  // Delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  // Get background color based on task status
  const getTaskCardColor = (status) => {
    switch (status) {
      case 'completed':
        return '#d4edda'; // green
      case 'cancelled':
        return '#f8d7da'; // red
      case 'in-progress':
        return '#fff3cd'; // orange
      default:
        return '#ffffff'; // default white
    }
  };

  // Add theme toggle handler
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <PaperProvider theme={isDarkMode ? CustomTheme.dark : CustomTheme.light}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.header, isDarkMode && styles.darkText]}>
            Task Manager
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.themeButton}
          onPress={toggleTheme}
          onLongPress={() => {
            Alert.alert(
              'About Task Manager',
              'Task Manager is a comprehensive task management application developed by Marvin Takula Phiri as part of an internship orientation task.\n\nFeatures:\n• Create and manage tasks\n• Set priority levels\n• Attach files and locations\n• Dark/Light mode support\n• Task status tracking\n• Due date notifications\n\nDeveloped by: Marvin Takula Phiri',
              [{ text: 'Close', style: 'default' }]
            );
          }}
          delayLongPress={500}
        >
          <MaterialIcons 
            name={isDarkMode ? "light-mode" : "dark-mode"} 
            size={22}
            color={isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'}
            style={{ opacity: 0.9 }}
          />
        </TouchableOpacity>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No tasks available</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setExpandedTaskId(expandedTaskId === item.id ? null : item.id)}
              style={[
                styles.taskCard,
                isDarkMode && styles.darkTaskCard,
                {
                  transform: [{scale: expandedTaskId === item.id ? 1.02 : 1}],
                  backgroundColor: isDarkMode ? Colors.dark.cardBackground : Colors.light.cardBackground,
                },
                item.status === 'completed' && styles.completedTaskCard,
                item.status === 'in-progress' && styles.inProgressTaskCard,
                item.status === 'cancelled' && styles.cancelledTaskCard,
              ]}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <Text style={[styles.taskTitle, isDarkMode && styles.darkText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.taskDate}>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.importanceIndicator}>
                  {item.importance === 'high' && 
                    <View style={[styles.importanceBadge, styles.highImportance]}>
                      <Text style={styles.importanceText}>High</Text>
                    </View>
                  }
                  {item.importance === 'medium' && 
                    <View style={[styles.importanceBadge, styles.mediumImportance]}>
                      <Text style={styles.importanceText}>Medium</Text>
                    </View>
                  }
                  {item.importance === 'low' && 
                    <View style={[styles.importanceBadge, styles.lowImportance]}>
                      <Text style={styles.importanceText}>Low</Text>
                    </View>
                  }
                </View>
              </View>

              {expandedTaskId === item.id && (
                <View style={styles.expandedContent}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                    Description
                  </Text>
                  <Text style={[styles.taskDescription, isDarkMode && styles.darkText]}>
                    {item.description}
                  </Text>

                  <View style={styles.statusSection}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                      Status
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      item.status === 'completed' && styles.statusBadgeComplete,
                      item.status === 'in-progress' && styles.statusBadgeInProgress,
                      item.status === 'cancelled' && styles.statusBadgeCancelled,
                    ]}>
                      <Text style={styles.statusText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {item.location && (
                    <View style={styles.locationSection}>
                      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                        Location
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setPreviewLocation(item.location);
                          setShowPreview(true);
                        }}
                        style={styles.previewButton}
                      >
                        <MaterialIcons 
                          name="location-on" 
                          size={20} 
                          color={isDarkMode ? Colors.dark.tint : Colors.light.tint} 
                        />
                        <Text style={styles.previewButtonText}>View Location</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {item.attachments && item.attachments.length > 0 && (
                    <View style={styles.attachmentsSection}>
                      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                        Attachments
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {item.attachments.map((uri, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              setPreviewImage(uri);
                              setShowPreview(true);
                            }}
                            style={styles.attachmentPreview}
                          >
                            <Image
                              source={{ uri }}
                              style={styles.attachmentThumbnail}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        item.status === 'completed' && styles.statusChangeButtonComplete,
                        item.status === 'in-progress' && styles.statusChangeButtonInProgress,
                        item.status === 'cancelled' && styles.statusChangeButtonCancelled,
                      ]}
                      onPress={() =>
                        toggleStatus(
                          item.id,
                          item.status === 'in-progress'
                            ? 'completed'
                            : item.status === 'completed'
                            ? 'cancelled'
                            : 'in-progress'
                        )
                      }
                    >
                      <Text style={styles.actionButtonText}>
                        {item.status === 'in-progress' ? 'Mark Complete' : 
                         item.status === 'completed' ? 'Cancel Task' : 'Restart Task'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => deleteTask(item.id)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons 
                        name="delete-outline" 
                        size={24} 
                        color={isDarkMode ? Colors.dark.danger : Colors.light.danger} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}
        />

        {/* Add Task Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={[
              styles.modalContent,
              isDarkMode && {
                backgroundColor: Colors.dark.cardBackground,
                borderColor: Colors.dark.separator,
                borderWidth: 1,
              }
            ]}>
              <Text style={[
                styles.modalHeader,
                isDarkMode && { color: Colors.dark.text }
              ]}>Create New Task</Text>
              <TextInput
                placeholder="Task Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor={theme === 'dark' ? '#888' : '#333'}
              />
              <TextInput
                placeholder="Task Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                placeholderTextColor={theme === 'dark' ? '#888' : '#333'}
              />
              <View style={styles.dateSection}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                  Date & Time
                </Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {date.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={tempDate}
                    mode="datetime"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setTempDate(selectedDate || tempDate);
                    }}
                  />
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)}
                      style={[
                        styles.datePickerButton,
                        isDarkMode && styles.darkButton
                      ]}
                    >
                      <Text style={[
                        styles.datePickerButtonText,
                        isDarkMode && { color: Colors.dark.text }
                      ]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setDate(tempDate);
                        setShowDatePicker(false);
                      }}
                      style={[
                        styles.datePickerButton,
                        styles.datePickerButtonConfirm,
                        isDarkMode && {
                          backgroundColor: Colors.dark.tint,
                          shadowColor: Colors.dark.tint,
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.5,
                          shadowRadius: 8,
                          elevation: 4,
                        }
                      ]}
                    >
                      <Text style={styles.datePickerButtonTextConfirm}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Location Selection */}
              <View style={styles.locationSection}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                  Location
                </Text>
                <TouchableOpacity 
                  style={styles.mapToggleButton}
                  onPress={() => setShowMap(!showMap)}
                >
                  <Text style={styles.buttonText}>
                    {showMap ? 'Hide Map' : 'Select Location'}
                  </Text>
                </TouchableOpacity>

                {showMap && (
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }}
                      onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                    >
                      {selectedLocation && (
                        <Marker
                          coordinate={selectedLocation}
                          draggable={true}
                          onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                        />
                      )}
                    </MapView>
                    <TouchableOpacity 
                      style={styles.currentLocationButton}
                      onPress={getCurrentLocation}
                    >
                      <Text style={styles.buttonIcon}>📍</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                onPress={pickImage} 
                style={[
                  styles.attachmentButton,
                  isDarkMode && styles.darkButton
                ]}
              >
                <View style={styles.attachmentButtonContent}>
                  <MaterialIcons 
                    name="attach-file" 
                    size={24} 
                    color={isDarkMode ? '#FFFFFF' : '#007AFF'} 
                  />
                  <Text style={[
                    styles.attachmentButtonText,
                    isDarkMode && { color: Colors.dark.text }
                  ]}>
                    Add Attachment
                  </Text>
                </View>
              </TouchableOpacity>

              {attachments.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.attachmentPreviewContainer}
                >
                  {attachments.map((uri, index) => (
                    <View key={index} style={styles.attachmentPreviewWrapper}>
                      <Image
                        source={{ uri }}
                        style={styles.attachmentPreviewImage}
                      />
                      <TouchableOpacity 
                        style={styles.removeAttachmentButton}
                        onPress={() => {
                          setAttachments(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <MaterialIcons name="close" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.importanceSection}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                  Importance
                </Text>
                <View style={styles.importanceButtons}>
                  {['Low', 'Medium', 'High'].map((level) => (
                    <TouchableOpacity 
                      key={level}
                      style={[
                        styles.importanceButton,
                        isDarkMode && styles.darkImportanceButton,
                        importance.toLowerCase() === level.toLowerCase() && [
                          styles.importanceButtonSelected,
                          isDarkMode && {
                            shadowColor: getImportanceColor(level.toLowerCase()),
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        ],
                      ]}
                      onPress={() => setImportance(level.toLowerCase())}
                    >
                      <Text style={[
                        styles.importanceButtonText,
                        isDarkMode && { color: Colors.dark.text },
                        importance.toLowerCase() === level.toLowerCase() && 
                          styles.importanceButtonTextSelected
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.addButton,
                  isDarkMode && {
                    borderColor: Colors.dark.success,
                    backgroundColor: 'transparent',
                  }
                ]} 
                onPress={addTask}
              >
                <Text style={[
                  styles.addButtonText,
                  isDarkMode && {
                    color: Colors.dark.success,
                  }
                ]}>
                  Add Task
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Preview Modals */}
        <Modal 
          visible={showPreview} 
          transparent
          animationType="fade"
        >
          <View style={styles.previewContainer}>
            <View style={[
              styles.previewContent,
              {
                backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
              }
            ]}>
              <View style={styles.previewHeader}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowPreview(false);
                    setPreviewImage(null);
                    setPreviewLocation(null);
                  }}
                  style={styles.previewCloseButton}
                >
                  <Text style={[
                    styles.previewCloseText,
                    { color: isDarkMode ? '#FFFFFF' : '#007AFF' }
                  ]}>Done</Text>
                </TouchableOpacity>
              </View>
              
              {previewImage && (
                <Image
                  source={{ uri: previewImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              
              {previewLocation && (
                <MapView
                  style={styles.previewMap}
                  initialRegion={{
                    ...previewLocation,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker coordinate={previewLocation} />
                </MapView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PaperProvider>
  );
};

export default TaskManager;
