import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import {Task} from '../types/Task';
import {useTask} from '../context/TaskContext';
import NotificationService from '../services/NotificationService';
import ProofVerificationService from '../services/ProofVerificationService';

interface LockScreenProps {
  task: Task;
  onTaskComplete: () => void;
}

const {width, height} = Dimensions.get('window');

const LockScreen: React.FC<LockScreenProps> = ({task, onTaskComplete}) => {
  const {updateTaskTime, completeTask} = useTask();
  const [timeSpent, setTimeSpent] = useState(task.timeSpent || 0);
  const [isRunning, setIsRunning] = useState(true);
  const [showMotivation, setShowMotivation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const motivationAnim = useRef(new Animated.Value(0)).current;

  const motivationalMessages = [
    "You're doing great! Keep pushing forward! 💪",
    "Every second counts towards your goal! ⏰",
    "Stay focused, you've got this! 🎯",
    "Your future self will thank you! 🌟",
    "Discipline is the bridge between goals and accomplishment! 🌉",
    "Success is the sum of small efforts repeated! 📈",
  ];

  useEffect(() => {
    // Prevent back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert(
          'Task in Progress',
          'You cannot exit while your task is active. Complete your task first.',
          [{text: 'OK'}]
        );
        return true;
      }
    );

    // Start timer
    startTimer();

    // Show motivational messages periodically
    const motivationInterval = setInterval(() => {
      showMotivationalMessage();
    }, 300000); // Every 5 minutes

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      backHandler.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(motivationInterval);
      pulseAnimation.stop();
    };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1;
        updateTaskTime(task.id, newTime);
        return newTime;
      });
    }, 1000);
    
    setIsRunning(true);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const showMotivationalMessage = () => {
    const randomMessage = motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
    ];
    
    setShowMotivation(true);
    
    Animated.sequence([
      Animated.timing(motivationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(motivationAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowMotivation(false));

    NotificationService.sendMotivationalMessage(task);
  };

  const handleCompleteTask = () => {
    Alert.alert(
      'Complete Task',
      'Are you ready to submit proof of completion?',
      [
        {text: 'Not Yet', style: 'cancel'},
        {
          text: 'Submit Proof',
          onPress: () => {
            // Navigate to proof submission
            // For now, we'll simulate completion
            pauseTimer();
            onTaskComplete();
            NotificationService.sendTaskCompleteNotification(task);
            NotificationService.clearTaskReminders(task.id);
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const remaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
    return remaining;
  };

  const getProgress = () => {
    const estimatedSeconds = task.estimatedDuration * 60;
    return Math.min(timeSpent / estimatedSeconds, 1);
  };

  const timeRemaining = getTimeRemaining();
  const progress = getProgress();
  const isOverdue = timeRemaining === 0;

  return (
    <LinearGradient 
      colors={isOverdue ? ['#1a0000', '#330000'] : ['#001a00', '#003300']} 
      style={styles.container}
    >
      {/* Lock Status Header */}
      <View style={styles.header}>
        <View style={styles.lockIndicator}>
          <Icon name="lock" size={24} color="#fff" />
          <Text style={styles.lockText}>DEVICE LOCKED</Text>
        </View>
        <Text style={styles.lockSubtext}>Complete your task to unlock</Text>
      </View>

      {/* Task Information */}
      <View style={styles.taskInfo}>
        <Animated.View style={[styles.taskTitleContainer, {transform: [{scale: pulseAnim}]}]}>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </Animated.View>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <Text style={styles.taskCategory}>{task.category}</Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time Spent</Text>
        <Text style={styles.timerDisplay}>{formatTime(timeSpent)}</Text>
        
        <Progress.Circle
          size={200}
          progress={progress}
          color={isOverdue ? '#F44336' : '#4CAF50'}
          unfilledColor="rgba(255,255,255,0.1)"
          borderWidth={0}
          thickness={8}
          showsText={false}
          style={styles.progressCircle}
        />
        
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% Complete
        </Text>
      </View>

      {/* Deadline Information */}
      <View style={styles.deadlineContainer}>
        <Icon 
          name={isOverdue ? "warning" : "schedule"} 
          size={20} 
          color={isOverdue ? "#F44336" : "#4CAF50"} 
        />
        <Text style={[styles.deadlineText, isOverdue && styles.overdueText]}>
          {isOverdue ? 'OVERDUE!' : `${formatTime(timeRemaining)} remaining`}
        </Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.pauseButton]}
          onPress={isRunning ? pauseTimer : startTimer}>
          <Icon name={isRunning ? "pause" : "play-arrow"} size={24} color="#fff" />
          <Text style={styles.controlButtonText}>
            {isRunning ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton]}
          onPress={handleCompleteTask}>
          <Icon name="check-circle" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>Complete Task</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contact */}
      <TouchableOpacity style={styles.emergencyButton}>
        <Icon name="phone" size={20} color="#F44336" />
        <Text style={styles.emergencyText}>Emergency Call Only</Text>
      </TouchableOpacity>

      {/* Motivational Message Overlay */}
      {showMotivation && (
        <Animated.View 
          style={[
            styles.motivationOverlay,
            {
              opacity: motivationAnim,
              transform: [{
                translateY: motivationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.motivationText}>
            {motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
          </Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  lockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  lockText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  lockSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  taskInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  taskTitleContainer: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  taskDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  taskCategory: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerLabel: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  progressCircle: {
    marginVertical: 20,
  },
  progressText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 10,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 20,
  },
  deadlineText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  overdueText: {
    color: '#F44336',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F44336',
    marginBottom: 20,
  },
  emergencyText: {
    color: '#F44336',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  motivationOverlay: {
    position: 'absolute',
    top: height * 0.3,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  motivationText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LockScreen;