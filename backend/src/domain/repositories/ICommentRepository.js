// Repository Interface: ICommentRepository
class ICommentRepository {
  async findById(commentId) {
    throw new Error('Method must be implemented');
  }

  async findByPost(postId, options = {}) {
    throw new Error('Method must be implemented');
  }

  async findByAuthor(empId, options = {}) {
    throw new Error('Method must be implemented');
  }

  async findByParent(parentCommentId, options = {}) {
    throw new Error('Method must be implemented');
  }

  async findTopLevel(postId, options = {}) {
    throw new Error('Method must be implemented');
  }

  async findReplies(commentId, options = {}) {
    throw new Error('Method must be implemented');
  }

  async findByStatus(status, options = {}) {
    throw new Error('Method must be implemented');
  }

  async create(comment) {
    throw new Error('Method must be implemented');
  }

  async update(commentId, commentData) {
    throw new Error('Method must be implemented');
  }

  async updateContent(commentId, content) {
    throw new Error('Method must be implemented');
  }

  async updateStatus(commentId, status) {
    throw new Error('Method must be implemented');
  }

  async like(commentId) {
    throw new Error('Method must be implemented');
  }

  async unlike(commentId) {
    throw new Error('Method must be implemented');
  }

  async delete(commentId) {
    throw new Error('Method must be implemented');
  }

  async findAll(options = {}) {
    throw new Error('Method must be implemented');
  }

  async count() {
    throw new Error('Method must be implemented');
  }

  async countByPost(postId) {
    throw new Error('Method must be implemented');
  }

  async countByAuthor(empId) {
    throw new Error('Method must be implemented');
  }

  async countByStatus(status) {
    throw new Error('Method must be implemented');
  }

  async findRecent(limit = 10) {
    throw new Error('Method must be implemented');
  }

  async search(query, options = {}) {
    throw new Error('Method must be implemented');
  }

  async findPendingApproval() {
    throw new Error('Method must be implemented');
  }

  async getCommentTree(postId) {
    throw new Error('Method must be implemented');
  }

  async findMentions(empId, options = {}) {
    throw new Error('Method must be implemented');
  }
}

module.exports = ICommentRepository;
