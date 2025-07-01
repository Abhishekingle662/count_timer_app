# Productivity Enforcer

A React Native mobile app designed to act as a strict personal assistant that enforces task completion through device control and verification systems.

## Features

### 🎯 Task Management
- Create tasks with deadlines and priorities
- Set estimated duration and categories
- Use pre-built templates for common tasks
- Track time spent on each task

### 🔒 Device Control System
- Lock device during active tasks
- Block access to distracting apps
- Prevent app uninstallation during tasks
- Emergency call access only

### 📸 Proof Verification
- Photo/video evidence capture
- Document upload support
- GPS location verification
- AI-powered content validation

### 🔔 Smart Notifications
- Escalating reminder system
- Motivational messages during tasks
- Emergency contact alerts for overdue tasks
- Psychological triggers for motivation

### 🛡️ Security Features
- Device administrator privileges
- Uninstall protection during active tasks
- App usage monitoring
- Circumvention prevention

## Installation

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS dependencies (iOS only):
   ```bash
   cd ios && pod install
   ```

4. Run the app:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## Permissions Required

### Android
- Device Administrator
- Camera
- Location (Fine & Coarse)
- Storage (Read & Write)
- SMS
- Contacts
- System Alert Window
- Package Usage Stats

### iOS
- Camera
- Location (When In Use)
- Photo Library
- Notifications

## Architecture

### Core Components
- **TaskContext**: Manages task state and operations
- **SecurityContext**: Handles device security and app blocking
- **NotificationService**: Manages all notification types
- **SecurityService**: Controls device admin features
- **ProofVerificationService**: Validates submitted proof

### Screens
- **HomeScreen**: Task overview and management
- **TaskScreen**: Task creation with templates
- **LockScreen**: Active task interface with timer
- **ProofScreen**: Evidence submission and verification
- **SettingsScreen**: App configuration and security

## Security Implementation

### Device Admin Features
- Prevent app uninstallation
- Lock device functions
- Monitor app usage
- Block specified applications

### Proof Verification
- AI-based content analysis
- Location verification with GPS
- Timestamp validation
- Metadata verification

### Anti-Circumvention
- Background service monitoring
- System overlay detection
- Root/jailbreak detection
- Developer options monitoring

## Configuration

### Emergency Contacts
Configure emergency contacts in Settings who will be notified if critical tasks remain incomplete.

### Blocked Apps
Customize which apps are blocked during task execution. Common social media and entertainment apps are blocked by default.

### Notification Settings
Configure reminder frequency and escalation patterns for different task priorities.

## Development

### Building for Production

#### Android
```bash
npm run build:android
```

#### iOS
```bash
npm run build:ios
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Privacy & Data

- All data stored locally on device
- No cloud synchronization by default
- Location data used only for task verification
- Photos/videos stored in app sandbox

## Legal Considerations

This app requires device administrator privileges and implements strict controls. Users must:
- Explicitly consent to device admin activation
- Understand the app's control mechanisms
- Have the ability to disable admin privileges when no tasks are active

## Support

For issues or questions:
1. Check the troubleshooting guide
2. Review device compatibility
3. Ensure all permissions are granted
4. Contact support with device logs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This app is designed for personal productivity enhancement. Users are responsible for:
- Proper configuration of emergency contacts
- Understanding security implications
- Compliance with local laws regarding device monitoring
- Safe usage practices

The developers are not responsible for any issues arising from misuse or misconfiguration of the application.