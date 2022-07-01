class User {
  #userId;

  constructor(userId) {
    // Assign uid
    this.#userId = userId;
  }

  getUserId() {
    return this.#userId;
  }
}

module.exports = User;
