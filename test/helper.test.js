const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("should return null for no users with given email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.isObject(user, expectedUserID);
  });
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it(`should return proper user's email`, () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserEmail = "user@example.com";
    assert.equal(user.email, expectedUserEmail);
  });
  it(`should return proper user's password`, () => {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedUserPassword = "dishwasher-funk";
    assert.equal(user.password, expectedUserPassword);
  });
  it("should return null for no users with given email", () => {
    const user = getUserByEmail("notGonnaWork@example.com", testUsers);
    const expectedUserPassword = undefined;
    assert.equal(user, expectedUserPassword);
  });
  it("should return null for no users with given email", () => {
    const user = getUserByEmail("notGonnaWork@example.com", testUsers);
    const expectedUserPassword = null;
    assert.equal(user, expectedUserPassword);
  });
});
