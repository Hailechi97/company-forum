// Domain Entity: Post
class Post {
  constructor({
    postId = null,
    empId,
    title,
    content,
    imageURL = null,
    postedDate = new Date(),
    views = 0,
    likes = 0,
    dislikes = 0,
    status = 'Công khai', // 'Công khai', 'Nháp', 'Ẩn'
    location = null,
    tags = [],
    isUrgent = false,
    allowComments = true
  }) {
    this.postId = postId;
    this.empId = empId;
    this.title = title;
    this.content = content;
    this.imageURL = imageURL;
    this.postedDate = postedDate;
    this.views = views;
    this.likes = likes;
    this.dislikes = dislikes;
    this.status = status;
    this.location = location;
    this.tags = tags;
    this.isUrgent = isUrgent;
    this.allowComments = allowComments;
  }

  // Domain methods
  canBeEditedBy(empId, userRole) {
    // Author can edit their own posts
    if (this.empId === empId) return true;
    
    // Managers and admins can edit any post
    if (userRole === 'Manager' || userRole === 'Admin') return true;
    
    return false;
  }

  canBeDeletedBy(empId, userRole) {
    // Same logic as edit for now
    return this.canBeEditedBy(empId, userRole);
  }

  canAddComment() {
    return this.status === 'Công khai' && this.allowComments;
  }

  isPublic() {
    return this.status === 'Công khai';
  }

  isDraft() {
    return this.status === 'Nháp';
  }

  isHidden() {
    return this.status === 'Ẩn';
  }

  publish() {
    this.status = 'Công khai';
  }

  hide() {
    this.status = 'Ẩn';
  }

  makeDraft() {
    this.status = 'Nháp';
  }

  incrementViewCount() {
    this.views += 1;
  }

  like() {
    this.likes += 1;
  }

  unlike() {
    if (this.likes > 0) {
      this.likes -= 1;
    }
  }

  dislike() {
    this.dislikes += 1;
  }

  undislike() {
    if (this.dislikes > 0) {
      this.dislikes -= 1;
    }
  }

  makeUrgent() {
    this.isUrgent = true;
  }

  removeUrgent() {
    this.isUrgent = false;
  }

  disableComments() {
    this.allowComments = false;
  }

  enableComments() {
    this.allowComments = true;
  }

  update({ title, content, imageURL, location, tags, isUrgent, allowComments }) {
    if (title) this.title = title;
    if (content) this.content = content;
    if (imageURL !== undefined) this.imageURL = imageURL;
    if (location !== undefined) this.location = location;
    if (tags) this.tags = tags;
    if (isUrgent !== undefined) this.isUrgent = isUrgent;
    if (allowComments !== undefined) this.allowComments = allowComments;
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  // Validation
  validate() {
    const errors = [];
    
    if (!this.title || this.title.length < 5) {
      errors.push('Title must be at least 5 characters');
    }
    
    if (!this.content || this.content.length < 10) {
      errors.push('Content must be at least 10 characters');
    }
    
    if (!this.empId) {
      errors.push('Employee ID is required');
    }
    
    const validStatuses = ['Công khai', 'Nháp', 'Ẩn'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid status');
    }

    if (this.title && this.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    if (this.location && this.location.length > 255) {
      errors.push('Location must be less than 255 characters');
    }
    
    return errors;
  }

  // Convert to plain object for serialization
  toJSON() {
    return { ...this };
  }
}

module.exports = Post;
