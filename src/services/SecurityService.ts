import {Alert, Linking, NativeModules} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

class SecurityService {
  private static instance: SecurityService;
  private isLockModeActive = false;
  private blockedApps: string[] = [];

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async initialize() {
    await this.requestPermissions();
    await this.checkDeviceAdminStatus();
  }

  private async requestPermissions() {
    const permissions = [
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.SEND_SMS,
      PERMISSIONS.ANDROID.READ_CONTACTS,
    ];

    for (const permission of permissions) {
      const result = await check(permission);
      if (result !== RESULTS.GRANTED) {
        await request(permission);
      }
    }
  }

  private async checkDeviceAdminStatus() {
    try {
      const isAdmin = await DeviceInfo.isDeviceAdmin();
      if (!isAdmin) {
        Alert.alert(
          'Device Admin Required',
          'This app requires device administrator privileges to function properly. Please enable it in settings.',
          [
            {
              text: 'Open Settings',
              onPress: () => this.openDeviceAdminSettings(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking device admin status:', error);
    }
  }

  private openDeviceAdminSettings() {
    Linking.openSettings();
  }

  enableLockMode(blockedApps: string[] = []) {
    this.isLockModeActive = true;
    this.blockedApps = blockedApps;
    
    // Start monitoring app usage
    this.startAppMonitoring();
    
    // Disable certain system functions
    this.disableSystemFunctions();
  }

  disableLockMode() {
    this.isLockModeActive = false;
    this.blockedApps = [];
    
    // Stop monitoring
    this.stopAppMonitoring();
    
    // Re-enable system functions
    this.enableSystemFunctions();
  }

  private startAppMonitoring() {
    // This would require a native module to monitor app launches
    // For now, we'll use a placeholder implementation
    console.log('App monitoring started');
    
    // In a real implementation, this would:
    // 1. Monitor foreground app changes
    // 2. Block access to specified apps
    // 3. Show overlay when blocked apps are accessed
  }

  private stopAppMonitoring() {
    console.log('App monitoring stopped');
  }

  private disableSystemFunctions() {
    // This would require system-level permissions
    // Placeholder for functions like:
    // - Disable home button (requires root/admin)
    // - Disable recent apps button
    // - Disable notification panel
    console.log('System functions disabled');
  }

  private enableSystemFunctions() {
    console.log('System functions enabled');
  }

  isAppBlocked(packageName: string): boolean {
    return this.isLockModeActive && this.blockedApps.includes(packageName);
  }

  showBlockedAppWarning(appName: string) {
    Alert.alert(
      '🚫 App Blocked',
      `${appName} is blocked while your task is active. Complete your task to regain access.`,
      [
        {
          text: 'Return to Task',
          style: 'default',
        },
      ],
      { cancelable: false }
    );
  }

  async preventUninstall(): Promise<boolean> {
    try {
      // This would require device admin privileges
      // In a real implementation, this would prevent the app from being uninstalled
      const isAdmin = await DeviceInfo.isDeviceAdmin();
      return isAdmin;
    } catch (error) {
      console.error('Error preventing uninstall:', error);
      return false;
    }
  }

  getLockStatus() {
    return {
      isLocked: this.isLockModeActive,
      blockedApps: this.blockedApps,
    };
  }
}

export default SecurityService.getInstance();