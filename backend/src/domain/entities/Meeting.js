// Domain Entity: Meeting
class Meeting {
  constructor({
    meetingId = null,
    title,
    content,
    startTime,
    endTime,
    organizer,
    participants = '',
    location
  }) {
    this.meetingId = meetingId;
    this.title = title;
    this.content = content;
    this.startTime = startTime;
    this.endTime = endTime;
    this.organizer = organizer;
    this.participants = participants;
    this.location = location;
  }

  // Domain methods
  canBeEditedBy(empId, userRole) {
    // Organizer can edit their meetings
    if (this.organizer === empId) return true;
    
    // Managers and admins can edit any meeting
    if (userRole === 'Manager' || userRole === 'Admin') return true;
    
    return false;
  }

  canBeDeletedBy(empId, userRole) {
    return this.canBeEditedBy(empId, userRole);
  }

  isUpcoming() {
    return new Date(this.startTime) > new Date();
  }

  isOngoing() {
    const now = new Date();
    return new Date(this.startTime) <= now && new Date(this.endTime) >= now;
  }

  isPast() {
    return new Date(this.endTime) < new Date();
  }

  getDuration() {
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    return Math.round((end - start) / (1000 * 60)); // Duration in minutes
  }

  update({ title, content, startTime, endTime, participants, location }) {
    if (title) this.title = title;
    if (content) this.content = content;
    if (startTime) this.startTime = startTime;
    if (endTime) this.endTime = endTime;
    if (participants !== undefined) this.participants = participants;
    if (location) this.location = location;
  }

  addParticipant(empId) {
    const participantsList = this.participants ? this.participants.split(',') : [];
    if (!participantsList.includes(empId)) {
      participantsList.push(empId);
      this.participants = participantsList.join(',');
    }
  }

  removeParticipant(empId) {
    const participantsList = this.participants ? this.participants.split(',') : [];
    this.participants = participantsList.filter(p => p !== empId).join(',');
  }

  getParticipantsList() {
    return this.participants ? this.participants.split(',').filter(p => p.trim()) : [];
  }

  // Validation
  validate() {
    const errors = [];
    
    if (!this.title || this.title.length < 3) {
      errors.push('Meeting title must be at least 3 characters');
    }
    
    if (!this.content || this.content.length < 10) {
      errors.push('Meeting content must be at least 10 characters');
    }
    
    if (!this.organizer) {
      errors.push('Meeting organizer is required');
    }

    if (!this.startTime) {
      errors.push('Start time is required');
    }

    if (!this.endTime) {
      errors.push('End time is required');
    }

    if (!this.location || this.location.length < 2) {
      errors.push('Meeting location is required');
    }

    if (this.startTime && this.endTime) {
      const start = new Date(this.startTime);
      const end = new Date(this.endTime);
      
      if (start >= end) {
        errors.push('End time must be after start time');
      }

      if (start < new Date()) {
        errors.push('Meeting cannot be scheduled in the past');
      }

      // Check if meeting duration is reasonable (max 8 hours)
      const durationHours = (end - start) / (1000 * 60 * 60);
      if (durationHours > 8) {
        errors.push('Meeting duration cannot exceed 8 hours');
      }
    }
    
    return errors;
  }

  // Convert to plain object for serialization
  toJSON() {
    return { ...this };
  }
}

module.exports = Meeting;
