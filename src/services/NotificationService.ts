import PushNotification from 'react-native-push-notification';
import BackgroundTimer from 'react-native-background-timer';
import {Task} from '../types/Task';

class NotificationService {
  private static instance: NotificationService;
  private reminderIntervals: Map<string, number> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize() {
    PushNotification.createChannel(
      {
        channelId: 'task-reminders',
        channelName: 'Task Reminders',
        channelDescription: 'Notifications for task deadlines and reminders',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'emergency-alerts',
        channelName: 'Emergency Alerts',
        channelDescription: 'Critical alerts for overdue tasks',
        playSound: true,
        soundName: 'default',
        importance: 5,
        vibrate: true,
      },
      (created) => console.log(`Emergency channel created: ${created}`)
    );
  }

  scheduleTaskReminders(task: Task) {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const timeUntilDeadline = deadline.getTime() - now.getTime();

    // Schedule reminders at different intervals
    const reminderTimes = [
      { time: timeUntilDeadline - 60 * 60 * 1000, message: '1 hour until deadline!' },
      { time: timeUntilDeadline - 30 * 60 * 1000, message: '30 minutes until deadline!' },
      { time: timeUntilDeadline - 15 * 60 * 1000, message: '15 minutes until deadline!' },
      { time: timeUntilDeadline - 5 * 60 * 1000, message: '5 minutes until deadline!' },
    ];

    reminderTimes.forEach((reminder, index) => {
      if (reminder.time > 0) {
        const timeoutId = BackgroundTimer.setTimeout(() => {
          this.sendTaskReminder(task, reminder.message);
        }, reminder.time);

        this.reminderIntervals.set(`${task.id}-${index}`, timeoutId);
      }
    });

    // Schedule escalating notifications after deadline
    if (timeUntilDeadline > 0) {
      const overdueTimeoutId = BackgroundTimer.setTimeout(() => {
        this.startEscalatingAlerts(task);
      }, timeUntilDeadline);

      this.reminderIntervals.set(`${task.id}-overdue`, overdueTimeoutId);
    }
  }

  private sendTaskReminder(task: Task, message: string) {
    const priority = this.getPriorityLevel(task.priority);
    
    PushNotification.localNotification({
      channelId: 'task-reminders',
      title: `Task: ${task.title}`,
      message: message,
      priority: priority,
      vibrate: true,
      playSound: true,
      actions: ['Complete Now', 'Snooze 5min'],
      userInfo: { taskId: task.id },
    });
  }

  private startEscalatingAlerts(task: Task) {
    let alertCount = 0;
    const maxAlerts = 10;
    
    const escalatingInterval = BackgroundTimer.setInterval(() => {
      alertCount++;
      
      const urgencyLevel = Math.min(alertCount, 5);
      const message = this.getEscalatingMessage(urgencyLevel, task.title);
      
      PushNotification.localNotification({
        channelId: 'emergency-alerts',
        title: '⚠️ OVERDUE TASK ⚠️',
        message: message,
        priority: 'max',
        vibrate: true,
        playSound: true,
        ongoing: true,
        userInfo: { taskId: task.id, overdue: true },
      });

      // Send emergency SMS after 5 failed attempts
      if (alertCount === 5 && task.emergencyContacts) {
        this.sendEmergencyAlerts(task);
      }

      if (alertCount >= maxAlerts) {
        BackgroundTimer.clearInterval(escalatingInterval);
      }
    }, this.getEscalatingInterval(alertCount));

    this.reminderIntervals.set(`${task.id}-escalating`, escalatingInterval);
  }

  private getEscalatingMessage(level: number, taskTitle: string): string {
    const messages = [
      `Your task "${taskTitle}" is overdue. Please complete it now.`,
      `URGENT: Task "${taskTitle}" is still incomplete. This is affecting your productivity goals.`,
      `CRITICAL: You are significantly behind on "${taskTitle}". Immediate action required.`,
      `WARNING: Continued delays on "${taskTitle}" may trigger emergency protocols.`,
      `FINAL NOTICE: Emergency contacts will be notified about your incomplete task "${taskTitle}".`,
    ];
    
    return messages[Math.min(level - 1, messages.length - 1)];
  }

  private getEscalatingInterval(alertCount: number): number {
    // Start with 5 minutes, decrease to 1 minute for urgent alerts
    const baseInterval = 5 * 60 * 1000; // 5 minutes
    const minInterval = 1 * 60 * 1000; // 1 minute
    
    return Math.max(baseInterval - (alertCount * 30 * 1000), minInterval);
  }

  private getPriorityLevel(priority: string): 'default' | 'high' | 'max' {
    switch (priority) {
      case 'critical': return 'max';
      case 'high': return 'high';
      default: return 'default';
    }
  }

  private async sendEmergencyAlerts(task: Task) {
    if (!task.emergencyContacts) return;

    const message = `PRODUCTIVITY ALERT: ${task.title} is overdue and incomplete. Please check on the task owner's progress.`;
    
    // This would require additional SMS service integration
    console.log('Emergency SMS would be sent:', message);
  }

  sendMotivationalMessage(task: Task) {
    const messages = [
      "You've got this! Stay focused and push through.",
      "Every minute counts. Keep going!",
      "Success is just around the corner. Don't give up!",
      "Your future self will thank you for this effort.",
      "Discipline is choosing between what you want now and what you want most.",
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    PushNotification.localNotification({
      channelId: 'task-reminders',
      title: '💪 Stay Motivated!',
      message: randomMessage,
      priority: 'default',
      vibrate: false,
      playSound: false,
    });
  }

  clearTaskReminders(taskId: string) {
    // Clear all intervals for this task
    for (const [key, intervalId] of this.reminderIntervals.entries()) {
      if (key.startsWith(taskId)) {
        BackgroundTimer.clearTimeout(intervalId);
        BackgroundTimer.clearInterval(intervalId);
        this.reminderIntervals.delete(key);
      }
    }

    // Cancel scheduled notifications
    PushNotification.cancelLocalNotifications({ userInfo: { taskId } });
  }

  sendTaskStartNotification(task: Task) {
    PushNotification.localNotification({
      channelId: 'task-reminders',
      title: '🚀 Task Started!',
      message: `You've started "${task.title}". Stay focused and avoid distractions!`,
      priority: 'high',
      vibrate: true,
      playSound: true,
    });
  }

  sendTaskCompleteNotification(task: Task) {
    PushNotification.localNotification({
      channelId: 'task-reminders',
      title: '🎉 Task Completed!',
      message: `Congratulations! You've successfully completed "${task.title}".`,
      priority: 'default',
      vibrate: true,
      playSound: true,
    });
  }
}

export default NotificationService.getInstance();