import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTask} from '../context/TaskContext';
import {useSecurity} from '../context/SecurityContext';
import {Task} from '../types/Task';
import NotificationService from '../services/NotificationService';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {tasks, activeTask, startTask, deleteTask} = useTask();
  const {setLocked} = useSecurity();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check for overdue tasks
    checkOverdueTasks();
  }, [tasks]);

  const checkOverdueTasks = () => {
    const now = new Date();
    const overdueTasks = tasks.filter(
      task => task.status === 'pending' && new Date(task.deadline) < now
    );

    if (overdueTasks.length > 0) {
      Alert.alert(
        '⚠️ Overdue Tasks',
        `You have ${overdueTasks.length} overdue task(s). Please complete them immediately.`,
        [{text: 'OK'}]
      );
    }
  };

  const handleStartTask = async (task: Task) => {
    Alert.alert(
      'Start Task',
      `Are you ready to start "${task.title}"? This will lock your device and block distracting apps.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Start',
          onPress: async () => {
            await startTask(task.id);
            setLocked(true);
            NotificationService.scheduleTaskReminders(task);
            NotificationService.sendTaskStartNotification(task);
          },
        },
      ]
    );
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ]
    );
  };

  const getTaskStatusColor = (task: Task) => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    if (task.status === 'completed') return '#4CAF50';
    if (task.status === 'active') return '#2196F3';
    if (deadline < now) return '#F44336';
    if (task.priority === 'critical') return '#FF5722';
    if (task.priority === 'high') return '#FF9800';
    return '#9E9E9E';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return 'priority-high';
      case 'high': return 'keyboard-arrow-up';
      case 'medium': return 'remove';
      default: return 'keyboard-arrow-down';
    }
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderTaskItem = ({item}: {item: Task}) => (
    <TouchableOpacity
      style={[styles.taskCard, {borderLeftColor: getTaskStatusColor(item)}]}
      onPress={() => item.status === 'pending' ? handleStartTask(item) : null}
      disabled={item.status !== 'pending'}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Icon
            name={getPriorityIcon(item.priority)}
            size={20}
            color={getTaskStatusColor(item)}
          />
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteTask(item)}
          style={styles.deleteButton}>
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.taskDescription}>{item.description}</Text>
      
      <View style={styles.taskDetails}>
        <View style={styles.taskDetailItem}>
          <Icon name="schedule" size={16} color="#666" />
          <Text style={styles.taskDetailText}>
            {formatTimeRemaining(new Date(item.deadline))}
          </Text>
        </View>
        
        <View style={styles.taskDetailItem}>
          <Icon name="timer" size={16} color="#666" />
          <Text style={styles.taskDetailText}>
            {item.estimatedDuration}min
          </Text>
        </View>
        
        <View style={styles.taskDetailItem}>
          <Icon name="category" size={16} color="#666" />
          <Text style={styles.taskDetailText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.taskFooter}>
        <Text style={[styles.taskStatus, {color: getTaskStatusColor(item)}]}>
          {item.status.toUpperCase()}
        </Text>
        {item.status === 'pending' && (
          <Text style={styles.tapToStart}>Tap to start</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Task')}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {activeTask && (
        <View style={styles.activeTaskBanner}>
          <Icon name="play-circle-filled" size={24} color="#4CAF50" />
          <Text style={styles.activeTaskText}>
            Task "{activeTask.title}" is active
          </Text>
        </View>
      )}

      <FlatList
        data={tasks.sort((a, b) => {
          // Sort by status (active first), then by deadline
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (b.status === 'active' && a.status !== 'active') return 1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        })}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="assignment" size={64} color="#666" />
            <Text style={styles.emptyStateText}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first task to get started
            </Text>
            <TouchableOpacity
              style={styles.createTaskButton}
              onPress={() => navigation.navigate('Task')}>
              <Text style={styles.createTaskButtonText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeTaskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activeTaskText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 10,
  },
  taskList: {
    padding: 20,
    paddingTop: 0,
  },
  taskCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetailText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tapToStart: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  createTaskButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  createTaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;