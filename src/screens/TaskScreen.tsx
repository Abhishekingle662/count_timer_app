import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import {useTask} from '../context/TaskContext';
import {Task, TaskTemplate} from '../types/Task';

interface TaskScreenProps {
  navigation: any;
}

const TaskScreen: React.FC<TaskScreenProps> = ({navigation}) => {
  const {createTask, templates} = useTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour from now
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [category, setCategory] = useState('Personal');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [requiresLocation, setRequiresLocation] = useState(false);
  const [proofType, setProofType] = useState<'photo' | 'video' | 'document' | 'location' | 'combination'>('photo');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  const priorityOptions = [
    {value: 'low', label: 'Low', color: '#4CAF50'},
    {value: 'medium', label: 'Medium', color: '#FF9800'},
    {value: 'high', label: 'High', color: '#F44336'},
    {value: 'critical', label: 'Critical', color: '#9C27B0'},
  ];

  const proofTypeOptions = [
    {value: 'photo', label: 'Photo', icon: 'photo-camera'},
    {value: 'video', label: 'Video', icon: 'videocam'},
    {value: 'document', label: 'Document', icon: 'description'},
    {value: 'location', label: 'Location', icon: 'location-on'},
    {value: 'combination', label: 'Multiple', icon: 'apps'},
  ];

  const categoryOptions = [
    'Personal', 'Work', 'Health', 'Education', 'Finance', 'Social', 'Other'
  ];

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    if (deadline <= new Date()) {
      Alert.alert('Error', 'Deadline must be in the future');
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'timeSpent'> = {
      title: title.trim(),
      description: description.trim(),
      deadline,
      priority,
      category,
      estimatedDuration: parseInt(estimatedDuration) || 60,
      requiresLocation,
      proofType,
      blockedApps: selectedTemplate?.blockedApps || [
        'com.instagram.android',
        'com.twitter.android',
        'com.tiktok',
        'com.youtube.android',
      ],
    };

    try {
      await createTask(taskData);
      Alert.alert(
        'Success',
        'Task created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const applyTemplate = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
    setCategory(template.category);
    setEstimatedDuration(template.estimatedDuration.toString());
    setProofType(template.proofType);
    setRequiresLocation(template.requiresLocation);
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate?.id === template.id && styles.selectedTemplate
                ]}
                onPress={() => applyTemplate(template)}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateCategory}>{template.category}</Text>
                <Text style={styles.templateDuration}>{template.estimatedDuration}min</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Task Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what needs to be done"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categoryOptions.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.selectedCategoryChip
                  ]}
                  onPress={() => setCategory(cat)}>
                  <Text style={[
                    styles.categoryChipText,
                    category === cat && styles.selectedCategoryChipText
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              placeholder="60"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Priority & Deadline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority & Timing</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityChip,
                    {borderColor: option.color},
                    priority === option.value && {backgroundColor: option.color}
                  ]}
                  onPress={() => setPriority(option.value as any)}>
                  <Text style={[
                    styles.priorityChipText,
                    priority === option.value && styles.selectedPriorityChipText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Icon name="schedule" size={20} color="#4CAF50" />
              <Text style={styles.dateButtonText}>
                {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Proof Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proof Requirements</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proof Type</Text>
            <View style={styles.proofTypeContainer}>
              {proofTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.proofTypeChip,
                    proofType === option.value && styles.selectedProofTypeChip
                  ]}
                  onPress={() => setProofType(option.value as any)}>
                  <Icon 
                    name={option.icon} 
                    size={20} 
                    color={proofType === option.value ? '#fff' : '#4CAF50'} 
                  />
                  <Text style={[
                    styles.proofTypeChipText,
                    proofType === option.value && styles.selectedProofTypeChipText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Requires Location Verification</Text>
            <Switch
              value={requiresLocation}
              onValueChange={setRequiresLocation}
              trackColor={{false: '#666', true: '#4CAF50'}}
              thumbColor={requiresLocation ? '#fff' : '#ccc'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
          <Icon name="add-task" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create Task</Text>
        </TouchableOpacity>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={deadline}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setDeadline(date);
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
        mode="datetime"
      />
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  templateCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: '#4CAF50',
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  templateDuration: {
    fontSize: 12,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryChip: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  selectedCategoryChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  priorityChipText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedPriorityChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  proofTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  proofTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedProofTypeChip: {
    backgroundColor: '#4CAF50',
  },
  proofTypeChipText: {
    color: '#4CAF50',
    fontSize: 14,
    marginLeft: 4,
  },
  selectedProofTypeChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TaskScreen;