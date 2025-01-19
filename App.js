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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Add a new task
  const addTask = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    const newTask = {
      id: Math.random().toString(),
      title,
      description,
      date: date.toDateString(),
      status: 'in-progress', // default status
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setModalVisible(false);
    clearInputs();
  };

  // Clear input fields
  const clearInputs = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Manager</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks available</Text>}
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskCard,
              { backgroundColor: getTaskCardColor(item.status) },
            ]}
          >
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <Text style={styles.taskDate}>{item.date}</Text>
            <Text style={styles.taskStatus}>{`Status: ${item.status}`}</Text>
            <View style={styles.taskActions}>
              <TouchableOpacity
                style={styles.statusChangeButton}
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
                <Text style={styles.statusChangeButtonText}>Change Status</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add Task Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Create New Task</Text>
            <TextInput
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Task Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButton}>
                {`Select Date: ${date.toDateString()}`}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>Add Task</Text>
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
        <Text style={styles.floatingButtonText}>+ New Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { paddingLeft: 10, paddingTop:50, fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'left' },
  emptyText: { textAlign: 'center', color: '#6c757d' },
  taskCard: { padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDescription: { fontSize: 14, color: '#6c757d', marginVertical: 5 },
  taskDate: { fontSize: 12, color: '#adb5bd' },
  taskStatus: { fontSize: 14, fontWeight: 'bold', marginVertical: 5 },
  taskActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statusChangeButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
  statusChangeButtonText: { color: '#fff', fontWeight: 'bold' },
  deleteButton: { fontSize: 18, color: '#dc3545' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 5, padding: 10, marginBottom: 10 },
  dateButton: { padding: 10, backgroundColor: '#007bff', borderRadius: 5, color: '#fff', textAlign: 'center', marginBottom: 10 },
  addButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, marginBottom: 10 },
  addButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  closeButton: { color: '#dc3545', textAlign: 'center', fontSize: 16 },
  floatingButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007bff', borderRadius: 30, padding: 15, elevation: 5 },
  floatingButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default TaskManager;
