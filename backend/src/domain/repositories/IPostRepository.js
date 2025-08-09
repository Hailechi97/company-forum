// Interface for Post Repository
class IPostRepository {
  async create(post) {
    throw new Error('Method not implemented');
  }

  async findById(postId) {
    throw new Error('Method not implemented');
  }

  async findAll(options = {}) {
    throw new Error('Method not implemented');
  }

  async findByAuthor(empId, options = {}) {
    throw new Error('Method not implemented');
  }

  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }

  async findPublished(options = {}) {
    throw new Error('Method not implemented');
  }

  async findDrafts(empId, options = {}) {
    throw new Error('Method not implemented');
  }

  async update(postId, postData) {
    throw new Error('Method not implemented');
  }

  async delete(postId) {
    throw new Error('Method not implemented');
  }

  async search(query, options = {}) {
    throw new Error('Method not implemented');
  }

  async incrementViewCount(postId) {
    throw new Error('Method not implemented');
  }

  async incrementCommentCount(postId) {
    throw new Error('Method not implemented');
  }

  async decrementCommentCount(postId) {
    throw new Error('Method not implemented');
  }

  async like(postId, empId) {
    throw new Error('Method not implemented');
  }

  async unlike(postId, empId) {
    throw new Error('Method not implemented');
  }

  async getEmployeeLikes(empId) {
    throw new Error('Method not implemented');
  }

  async getPostLikes(postId) {
    throw new Error('Method not implemented');
  }

  async updateStatus(postId, status) {
    throw new Error('Method not implemented');
  }

  async getFeaturedPosts(limit = 5) {
    throw new Error('Method not implemented');
  }

  async getPopularPosts(timeframe = 'week', limit = 10) {
    throw new Error('Method not implemented');
  }

  async getRecentPosts(limit = 10) {
    throw new Error('Method not implemented');
  }

  async count() {
    throw new Error('Method not implemented');
  }

  async countByStatus(status) {
    throw new Error('Method not implemented');
  }

  async countByAuthor(empId) {
    throw new Error('Method not implemented');
  }

  async updateImageURL(postId, imageURL) {
    throw new Error('Method not implemented');
  }

  async findWithImages(options = {}) {
    throw new Error('Method not implemented');
  }

  async getRecentPosts(limit = 20) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPostRepository;
