import React, {useEffect, useState} from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, Alert, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './screens/HomeScreen';
import TaskScreen from './screens/TaskScreen';
import ProofScreen from './screens/ProofScreen';
import SettingsScreen from './screens/SettingsScreen';
import LockScreen from './screens/LockScreen';
import {TaskProvider} from './context/TaskContext';
import {SecurityProvider} from './context/SecurityContext';
import NotificationService from './services/NotificationService';
import SecurityService from './services/SecurityService';
import {Task} from './types/Task';

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    // Initialize services
    NotificationService.initialize();
    SecurityService.initialize();

    // Check if app should be locked on startup
    checkLockStatus();

    // Prevent back button from closing app when locked
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isLocked) {
          Alert.alert(
            'Task in Progress',
            'You cannot exit the app while a task is active. Complete your task first.',
            [{text: 'OK'}]
          );
          return true; // Prevent default behavior
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isLocked]);

  const checkLockStatus = async () => {
    try {
      const activeTask = await AsyncStorage.getItem('activeTask');
      if (activeTask) {
        const task = JSON.parse(activeTask);
        setCurrentTask(task);
        setIsLocked(true);
        SecurityService.enableLockMode();
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  if (isLocked && currentTask) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <SecurityProvider>
          <TaskProvider>
            <LockScreen 
              task={currentTask}
              onTaskComplete={() => {
                setIsLocked(false);
                setCurrentTask(null);
                SecurityService.disableLockMode();
              }}
            />
          </TaskProvider>
        </SecurityProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <SecurityProvider>
        <TaskProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1a1a1a',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{title: 'Productivity Enforcer'}}
              />
              <Stack.Screen 
                name="Task" 
                component={TaskScreen}
                options={{title: 'Create Task'}}
              />
              <Stack.Screen 
                name="Proof" 
                component={ProofScreen}
                options={{title: 'Submit Proof'}}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{title: 'Settings'}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </TaskProvider>
      </SecurityProvider>
    </SafeAreaProvider>
  );
};

export default App;