const getUserByEmail = (email, database) => {
  for (let userid in database) {
    if (database[userid]['email'] === email) {
      return database[userid];
    }
  }
};

module.exports = getUserByEmail;