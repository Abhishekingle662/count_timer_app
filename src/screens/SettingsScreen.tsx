import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSecurity} from '../context/SecurityContext';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({navigation}) => {
  const {
    blockedApps,
    emergencyContacts,
    addBlockedApp,
    removeBlockedApp,
    addEmergencyContact,
    removeEmergencyContact,
  } = useSecurity();

  const [newContact, setNewContact] = useState('');
  const [newApp, setNewApp] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [strictModeEnabled, setStrictModeEnabled] = useState(true);

  const commonApps = [
    {name: 'Instagram', package: 'com.instagram.android'},
    {name: 'TikTok', package: 'com.tiktok'},
    {name: 'Twitter', package: 'com.twitter.android'},
    {name: 'YouTube', package: 'com.youtube.android'},
    {name: 'Facebook', package: 'com.facebook.katana'},
    {name: 'Snapchat', package: 'com.snapchat.android'},
    {name: 'WhatsApp', package: 'com.whatsapp'},
    {name: 'Telegram', package: 'org.telegram.messenger'},
  ];

  const handleAddContact = () => {
    if (!newContact.trim()) {
      Alert.alert('Error', 'Please enter a contact number');
      return;
    }

    addEmergencyContact(newContact.trim());
    setNewContact('');
    Alert.alert('Success', 'Emergency contact added');
  };

  const handleRemoveContact = (contact: string) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contact} from emergency contacts?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeEmergencyContact(contact),
        },
      ]
    );
  };

  const handleToggleApp = (packageName: string) => {
    if (blockedApps.includes(packageName)) {
      removeBlockedApp(packageName);
    } else {
      addBlockedApp(packageName);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset logic here
            Alert.alert('Success', 'Settings have been reset');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="notifications" size={24} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders and alerts
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: '#666', true: '#4CAF50'}}
              thumbColor={notificationsEnabled ? '#fff' : '#ccc'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="security" size={24} color="#F44336" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Strict Mode</Text>
                <Text style={styles.settingDescription}>
                  Enhanced security and app blocking
                </Text>
              </View>
            </View>
            <Switch
              value={strictModeEnabled}
              onValueChange={setStrictModeEnabled}
              trackColor={{false: '#666', true: '#F44336'}}
              thumbColor={strictModeEnabled ? '#fff' : '#ccc'}
            />
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionDescription}>
            These contacts will be notified if you fail to complete critical tasks
          </Text>
          
          <View style={styles.addContactContainer}>
            <TextInput
              style={styles.contactInput}
              value={newContact}
              onChangeText={setNewContact}
              placeholder="Enter phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <Icon name="phone" size={20} color="#4CAF50" />
              <Text style={styles.contactText}>{contact}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveContact(contact)}
                style={styles.removeButton}>
                <Icon name="close" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          ))}

          {emergencyContacts.length === 0 && (
            <Text style={styles.emptyText}>No emergency contacts added</Text>
          )}
        </View>

        {/* Blocked Apps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blocked Apps</Text>
          <Text style={styles.sectionDescription}>
            These apps will be blocked during active tasks
          </Text>

          {commonApps.map((app) => (
            <View key={app.package} style={styles.appItem}>
              <View style={styles.appInfo}>
                <Icon name="apps" size={24} color="#4CAF50" />
                <Text style={styles.appName}>{app.name}</Text>
              </View>
              <Switch
                value={blockedApps.includes(app.package)}
                onValueChange={() => handleToggleApp(app.package)}
                trackColor={{false: '#666', true: '#F44336'}}
                thumbColor={blockedApps.includes(app.package) ? '#fff' : '#ccc'}
              />
            </View>
          ))}
        </View>

        {/* Security Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Information</Text>
          
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color="#2196F3" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Device Admin Required</Text>
              <Text style={styles.infoDescription}>
                This app requires device administrator privileges to prevent circumvention during active tasks.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="warning" size={24} color="#FF9800" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Uninstall Protection</Text>
              <Text style={styles.infoDescription}>
                The app cannot be uninstalled while tasks are active to ensure accountability.
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: '#F44336'}]}>Danger Zone</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleResetSettings}>
            <Icon name="refresh" size={24} color="#F44336" />
            <Text style={styles.dangerButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Productivity Enforcer v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Designed to help you stay focused and accountable
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  addContactContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contactInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contactText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appName: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SettingsScreen;