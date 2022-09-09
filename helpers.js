// ------- Helper Functions
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
};
const generateRandomNumber = () => {
  return Math.random().toString(36).substring(2, 8);
};
const urlsForUser = (userID, urlDatabase) => {
  let userDatabase = {};
  for (const shortID in urlDatabase) {
    if (userID === urlDatabase[shortID].userID) {
      userDatabase[shortID] = urlDatabase[shortID];
    }
  }
  return userDatabase;
};

module.exports = {
  getUserByEmail,
  generateRandomNumber,
  urlsForUser,
};
