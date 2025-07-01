import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchCamera, launchImageLibrary, MediaType} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {Task, ProofSubmission} from '../types/Task';
import {useTask} from '../context/TaskContext';
import ProofVerificationService from '../services/ProofVerificationService';
import uuid from 'react-native-uuid';

interface ProofScreenProps {
  navigation: any;
  route: {
    params: {
      taskId: string;
    };
  };
}

const ProofScreen: React.FC<ProofScreenProps> = ({navigation, route}) => {
  const {taskId} = route.params;
  const {getTaskById, completeTask} = useTask();
  const [task, setTask] = useState<Task | null>(null);
  const [proofSubmissions, setProofSubmissions] = useState<ProofSubmission[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);

  useEffect(() => {
    const foundTask = getTaskById(taskId);
    if (foundTask) {
      setTask(foundTask);
      getCurrentLocation();
    } else {
      Alert.alert('Error', 'Task not found');
      navigation.goBack();
    }
  }, [taskId]);

  const getCurrentLocation = async () => {
    const location = await ProofVerificationService.getCurrentLocation();
    setCurrentLocation(location);
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        addProofSubmission('photo', asset.uri);
      }
    });
  };

  const handleTakeVideo = () => {
    const options = {
      mediaType: 'video' as MediaType,
      quality: 0.8,
      durationLimit: 300, // 5 minutes max
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        addProofSubmission('video', asset.uri);
      }
    });
  };

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx],
      });
      
      addProofSubmission('document', result.uri);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to select document');
      }
    }
  };

  const handleLocationProof = () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get current location');
      return;
    }

    addProofSubmission('location');
  };

  const addProofSubmission = (type: 'photo' | 'video' | 'document' | 'location', uri?: string) => {
    const submission: ProofSubmission = {
      id: uuid.v4() as string,
      type,
      uri,
      location: currentLocation ? {
        ...currentLocation,
        timestamp: new Date(),
      } : undefined,
      timestamp: new Date(),
      verified: false,
    };

    setProofSubmissions(prev => [...prev, submission]);
  };

  const handleSubmitProof = async () => {
    if (proofSubmissions.length === 0) {
      Alert.alert('Error', 'Please provide at least one proof submission');
      return;
    }

    if (!task) return;

    setIsVerifying(true);

    try {
      // Verify each proof submission
      const verificationPromises = proofSubmissions.map(submission =>
        ProofVerificationService.verifyProof(task, submission)
      );

      const verificationResults = await Promise.all(verificationPromises);
      const allVerified = verificationResults.every(result => result);

      if (allVerified) {
        await completeTask(task.id, proofSubmissions);
        Alert.alert(
          '✅ Task Completed!',
          'Your proof has been verified and the task is now complete.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert(
          '❌ Verification Failed',
          'Some of your proof submissions could not be verified. Please try again with better evidence.',
          [
            {text: 'Try Again'},
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify proof. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const removeProofSubmission = (id: string) => {
    setProofSubmissions(prev => prev.filter(submission => submission.id !== id));
  };

  const renderProofSubmission = (submission: ProofSubmission) => (
    <View key={submission.id} style={styles.proofItem}>
      <View style={styles.proofHeader}>
        <Icon 
          name={getProofIcon(submission.type)} 
          size={24} 
          color="#4CAF50" 
        />
        <Text style={styles.proofType}>{submission.type.toUpperCase()}</Text>
        <TouchableOpacity
          onPress={() => removeProofSubmission(submission.id)}
          style={styles.removeButton}>
          <Icon name="close" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
      
      {submission.type === 'photo' && submission.uri && (
        <Image source={{uri: submission.uri}} style={styles.proofImage} />
      )}
      
      {submission.type === 'location' && submission.location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 {submission.location.latitude.toFixed(6)}, {submission.location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationTime}>
            {submission.location.timestamp.toLocaleString()}
          </Text>
        </View>
      )}
      
      <Text style={styles.proofTimestamp}>
        Submitted: {submission.timestamp.toLocaleString()}
      </Text>
    </View>
  );

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'photo': return 'photo-camera';
      case 'video': return 'videocam';
      case 'document': return 'description';
      case 'location': return 'location-on';
      default: return 'attachment';
    }
  };

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Submit Proof</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
        </View>

        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Required Proof Type</Text>
          <View style={styles.requirementChip}>
            <Icon name={getProofIcon(task.proofType)} size={20} color="#4CAF50" />
            <Text style={styles.requirementText}>{task.proofType.toUpperCase()}</Text>
          </View>
          
          {task.requiresLocation && (
            <View style={styles.requirementChip}>
              <Icon name="location-on" size={20} color="#FF9800" />
              <Text style={styles.requirementText}>LOCATION REQUIRED</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Capture Proof</Text>
          
          <View style={styles.actionButtons}>
            {(task.proofType === 'photo' || task.proofType === 'combination') && (
              <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
                <Icon name="photo-camera" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>
            )}

            {(task.proofType === 'video' || task.proofType === 'combination') && (
              <TouchableOpacity style={styles.actionButton} onPress={handleTakeVideo}>
                <Icon name="videocam" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Record Video</Text>
              </TouchableOpacity>
            )}

            {(task.proofType === 'document' || task.proofType === 'combination') && (
              <TouchableOpacity style={styles.actionButton} onPress={handleSelectDocument}>
                <Icon name="description" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Upload Document</Text>
              </TouchableOpacity>
            )}

            {(task.proofType === 'location' || task.proofType === 'combination' || task.requiresLocation) && (
              <TouchableOpacity style={styles.actionButton} onPress={handleLocationProof}>
                <Icon name="location-on" size={32} color="#fff" />
                <Text style={styles.actionButtonText}>Capture Location</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {proofSubmissions.length > 0 && (
          <View style={styles.submissionsSection}>
            <Text style={styles.sectionTitle}>Your Submissions</Text>
            {proofSubmissions.map(renderProofSubmission)}
          </View>
        )}

        {proofSubmissions.length > 0 && (
          <TouchableOpacity
            style={[styles.submitButton, isVerifying && styles.submitButtonDisabled]}
            onPress={handleSubmitProof}
            disabled={isVerifying}>
            {isVerifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="check-circle" size={24} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {isVerifying ? 'Verifying...' : 'Submit & Complete Task'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  requirementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  requirementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  requirementText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  submissionsSection: {
    marginBottom: 24,
  },
  proofItem: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proofType: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationInfo: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  locationTime: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  proofTimestamp: {
    color: '#999',
    fontSize: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProofScreen;