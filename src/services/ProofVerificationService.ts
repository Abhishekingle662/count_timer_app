import {Alert} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {ProofSubmission, Task} from '../types/Task';

class ProofVerificationService {
  private static instance: ProofVerificationService;

  static getInstance(): ProofVerificationService {
    if (!ProofVerificationService.instance) {
      ProofVerificationService.instance = new ProofVerificationService();
    }
    return ProofVerificationService.instance;
  }

  async verifyProof(task: Task, proofSubmission: ProofSubmission): Promise<boolean> {
    try {
      let isValid = true;
      const verificationResults: string[] = [];

      // Location verification
      if (task.requiresLocation && task.requiredLocation) {
        const locationValid = await this.verifyLocation(task.requiredLocation, proofSubmission.location);
        if (!locationValid) {
          isValid = false;
          verificationResults.push('Location verification failed');
        } else {
          verificationResults.push('Location verified successfully');
        }
      }

      // Content verification based on type
      switch (proofSubmission.type) {
        case 'photo':
          const photoValid = await this.verifyPhoto(proofSubmission.uri!);
          if (!photoValid) {
            isValid = false;
            verificationResults.push('Photo verification failed');
          } else {
            verificationResults.push('Photo verified successfully');
          }
          break;

        case 'video':
          const videoValid = await this.verifyVideo(proofSubmission.uri!);
          if (!videoValid) {
            isValid = false;
            verificationResults.push('Video verification failed');
          } else {
            verificationResults.push('Video verified successfully');
          }
          break;

        case 'document':
          const docValid = await this.verifyDocument(proofSubmission.uri!);
          if (!docValid) {
            isValid = false;
            verificationResults.push('Document verification failed');
          } else {
            verificationResults.push('Document verified successfully');
          }
          break;
      }

      // Update proof submission with verification results
      proofSubmission.verified = isValid;
      proofSubmission.aiAnalysis = verificationResults.join('; ');

      return isValid;
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  private async verifyLocation(
    requiredLocation: {latitude: number; longitude: number; radius: number},
    submittedLocation?: {latitude: number; longitude: number; timestamp: Date}
  ): Promise<boolean> {
    if (!submittedLocation) {
      return false;
    }

    const distance = this.calculateDistance(
      requiredLocation.latitude,
      requiredLocation.longitude,
      submittedLocation.latitude,
      submittedLocation.longitude
    );

    return distance <= requiredLocation.radius;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async verifyPhoto(uri: string): Promise<boolean> {
    // Placeholder for AI-based photo verification
    // In a real implementation, this would:
    // 1. Analyze image content using ML models
    // 2. Check for tampering or editing
    // 3. Verify timestamp and metadata
    // 4. Compare against expected content based on task type

    console.log('Verifying photo:', uri);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, randomly return true/false
    // In production, this would use actual AI verification
    return Math.random() > 0.2; // 80% success rate for demo
  }

  private async verifyVideo(uri: string): Promise<boolean> {
    // Placeholder for AI-based video verification
    console.log('Verifying video:', uri);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return Math.random() > 0.3; // 70% success rate for demo
  }

  private async verifyDocument(uri: string): Promise<boolean> {
    // Placeholder for document verification
    console.log('Verifying document:', uri);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return Math.random() > 0.1; // 90% success rate for demo
  }

  async getCurrentLocation(): Promise<{latitude: number; longitude: number} | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  showVerificationResult(isValid: boolean, analysis: string) {
    Alert.alert(
      isValid ? '✅ Verification Successful' : '❌ Verification Failed',
      analysis,
      [{ text: 'OK' }]
    );
  }
}

export default ProofVerificationService.getInstance();