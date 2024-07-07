import React, { useState, useEffect } from 'react';
import { Get, Post, Put, Delete } from "src/lib/api";
import '../../styles/components/GoalSection.css';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { toast } from 'sonner'; // Importing toast from sonner
import { BellRing } from 'lucide-react'; // Importing the BellRing icon from lucide-react
import { useNavigate } from 'react-router-dom'; // Importing useNavigate hook for navigation

const GoalSetting = () => {
  const [goals, setGoals] = useState([]);
  const navigate = useNavigate();
  const { deleteNotification } = useNotification();
  const { sendNotification } = useNotification();
  const { updateNotifications } = useNotification();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    userID: user.userID,
    reminderEnabled: false,
    reminderTime: ''
  });

  // Get today's date in YYYY-MM-DD format to set as min for start date
  const today = new Date().toISOString().split('T')[0];

  const fetchGoals = async () => {
    const response = await Get('goals', null, {user: user});
    if (response.ok) {
      const data = await response.json();
      setGoals(data);
    } else {
      console.error("Failed to fetch goals");
    }
  };

  const usePollNotifications = () => {
    const fetchAndDisplayNotifications = async () => {
      console.log('Fetching notifications at', new Date().toLocaleTimeString());
      const response = await Get('notifications/recent', null, { user: user });
      if (response.ok) {
          const notifications = await response.json();
          console.log(`Fetched ${notifications.length} notifications`);
          notifications.forEach(notification => {
              console.log('Displaying notification:', notification.title);
              updateNotifications(user)
              toast.success(notification.title, {
                  description: notification.content,
                  icon: <BellRing size={24} />,
                  action: {
                      label: "Go",
                      onClick: () => {
                          deleteNotification(user, notification.id, () => {
                              navigate(notification.redirect);
                          });
                      }
                  }
              });

          });
      } else {
          console.error("Failed to fetch new notifications");
      }
    };


    useEffect(() => {
        const timesToCheck = [
            { hour: 8, minute: 0 },   // Morning
            { hour: 13, minute: 0 }, // Afternoon
            { hour: 18, minute: 0 }   // Evening
        ];

        const now = new Date();
        console.log('Current time:', now.toLocaleTimeString());

        timesToCheck.forEach(time => {
            const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.hour, time.minute);
            let delay = targetTime.getTime() - now.getTime();

            // If the target time has already passed, schedule for the next day
            if (delay < 0) {
                delay += 86400000; // 24 hours in milliseconds
            }

            console.log(`Scheduling notification check for ${time.hour}:${time.minute} with a delay of ${delay} milliseconds.`);

            const timer = setTimeout(() => {
                fetchAndDisplayNotifications();
                // Set an interval for daily checks
                setInterval(fetchAndDisplayNotifications, 86400000); // 24 hours
            }, delay);

        });
    }, []); // Dependency array is empty to ensure this effect runs once on mount

    return null;
};
  usePollNotifications();

  useEffect(() => {
    fetchGoals();
  }, [user.userID]);

  const handleInputChange = (e) => {
    setCurrentGoal({ ...currentGoal, [e.target.name]: e.target.value });
  };

  const openModal = (goal = null) => {
    setIsEditing(!!goal);
    setCurrentGoal(goal || {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      userID: user.userID,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();

    const payload = {
      ...currentGoal,
      userID: user.userID,
      reminderEnabled: currentGoal.reminderEnabled,
      reminderTime: currentGoal.reminderTime,
    };

    const action = isEditing ? Put : Post;
    const endpoint = isEditing ? `goals/${currentGoal.goalID}` : 'goals';

    const response = await action(endpoint, payload, null, {user: user});
    if (response.ok) {
      await fetchGoals();
      closeModal();

      // Right here, after the goal has been successfully saved/updated and before the modal is closed.
      handleGoalNotifications(currentGoal, isEditing);

    } else {
      alert('Failed to save goal');
    }
  };

  const handleDeleteGoal = async (goalID) => {
    const response = await Delete(`goals/${goalID}`, null, {user: user});
    if (response.ok) {
      setGoals(goals.filter(goal => goal.goalID !== goalID));
    } else {
      alert('Failed to delete goal');
    }
  };

  const handleGoalNotifications = (goal, isEditing) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to the start of the day for accurate comparison

    const startDate = new Date(goal.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(goal.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Check if the start date is today and it's not an edit to an existing goal
    if (!isEditing && startDate.getTime() === today.getTime()) {
      sendNotification(user, "Goal Starts Today", `${goal.title} starts today!`, "/home", true, "bell");
    }

    // Check if the end date is today
    if (endDate.getTime() === today.getTime()) {
      sendNotification(user, "Goal Deadline Today", `${goal.title} ends today! Make it count!`, "/home", true, "bell");
    }
  };



  return (
    <div className="goal-setting-section">
      <div className="goal-header">
        <h2 className="goal-setting-title">Your Goals</h2>
        <button className="create-goal-btn" onClick={() => openModal()}>+</button>
      </div>
      <div className="goal-list">
        {goals.map((goal) => (
          <div key={goal.goalID} className="goal-item" onClick={() => openModal(goal)}>
            <div className="goal-info">
              <div className="goal-title">{goal.title}</div>
              <div className="goal-description">{goal.description || 'No description provided'}</div>
            </div>
            <button className="goal-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.goalID); }}>×</button>
          </div>
        ))}
      </div>
      {goals.length === 0 && (
          <p className="no-goals-message">No goals set yet. Click '+' to add your first goal!</p>
      )}
    {showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{isEditing ? 'Edit Goal' : 'Add New Goal'}</h2>
          <form onSubmit={handleSaveGoal}>
            <input name="title" value={currentGoal.title} onChange={handleInputChange} placeholder="Goal title" required />
            <textarea name="description" value={currentGoal.description} onChange={handleInputChange} placeholder="Goal description" required></textarea>
            <label htmlFor="startDate">Start Date</label>
            <input id="startDate" name="startDate" type="date" value={currentGoal.startDate} onChange={handleInputChange} min={today} />
            <label htmlFor="endDate">End Date</label>
            <input id="endDate" name="endDate" type="date" value={currentGoal.endDate} onChange={handleInputChange} min={currentGoal.startDate || today} />
            <div className="reminder-settings">
              <>
                <label htmlFor="reminderTime" className="reminder-time-label">Reminder Time</label>
                <select
                  id="reminderTime"
                  value={currentGoal.reminderTime}
                  onChange={(e) => setCurrentGoal({ ...currentGoal, reminderTime: e.target.value })}
                  className="reminder-time-select"
                >
                  <option value="">N/A</option> {/* Removed disabled attribute and "Set Reminder" option */}
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </>
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-goal-btn">{isEditing ? 'Update Goal' : 'Save Goal'}</button>
              <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default GoalSetting;