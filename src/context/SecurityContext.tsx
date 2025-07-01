import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from '../services/SecurityService';

interface SecurityContextType {
  isLocked: boolean;
  blockedApps: string[];
  emergencyContacts: string[];
  setLocked: (locked: boolean) => void;
  addBlockedApp: (packageName: string) => void;
  removeBlockedApp: (packageName: string) => void;
  addEmergencyContact: (contact: string) => void;
  removeEmergencyContact: (contact: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isLocked, setIsLocked] = useState(false);
  const [blockedApps, setBlockedApps] = useState<string[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const storedBlockedApps = await AsyncStorage.getItem('blockedApps');
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      
      if (storedBlockedApps) {
        setBlockedApps(JSON.parse(storedBlockedApps));
      }
      
      if (storedContacts) {
        setEmergencyContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const setLocked = async (locked: boolean) => {
    setIsLocked(locked);
    if (locked) {
      SecurityService.enableLockMode();
    } else {
      SecurityService.disableLockMode();
    }
  };

  const addBlockedApp = async (packageName: string) => {
    const updatedApps = [...blockedApps, packageName];
    setBlockedApps(updatedApps);
    await AsyncStorage.setItem('blockedApps', JSON.stringify(updatedApps));
  };

  const removeBlockedApp = async (packageName: string) => {
    const updatedApps = blockedApps.filter(app => app !== packageName);
    setBlockedApps(updatedApps);
    await AsyncStorage.setItem('blockedApps', JSON.stringify(updatedApps));
  };

  const addEmergencyContact = async (contact: string) => {
    const updatedContacts = [...emergencyContacts, contact];
    setEmergencyContacts(updatedContacts);
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
  };

  const removeEmergencyContact = async (contact: string) => {
    const updatedContacts = emergencyContacts.filter(c => c !== contact);
    setEmergencyContacts(updatedContacts);
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
  };

  return (
    <SecurityContext.Provider value={{
      isLocked,
      blockedApps,
      emergencyContacts,
      setLocked,
      addBlockedApp,
      removeBlockedApp,
      addEmergencyContact,
      removeEmergencyContact,
    }}>
      {children}
    </SecurityContext.Provider>
  );
};