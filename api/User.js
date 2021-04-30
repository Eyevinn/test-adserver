class User {
  #userId;

  constructor(userId) {
    // Make a UUID.
    this.#userId = userId;
  }

  getUserId() {
    return this.#userId;
  }
}

module.exports = User;
