const utils = require('../../utils'),
      usersPage = require('../../page-objects/users/users.po.js'),
      helper = require('../../helper'),
      addUserModal = require('../../page-objects/users/add-user-modal.po.js');

const addedUser = 'fulltester' + new Date().getTime(),
      fullName = 'Bede Ngaruko',
      errorMessagePassword = element.all(by.css('span.help-block.ng-binding')).get(3);

describe('Add user  : ', () => {
  afterEach(done => {
    utils.resetBrowser();
    done();
  });

  afterAll(utils.afterEach);

  it('should add user with valid password', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm(addedUser, fullName, 'StrongP@ssword1');
    addUserModal.submit();
    browser.wait(() => {
      return element(by.css('#edit-user-profile')).isDisplayed()
        .then(isDisplayed => {
          return !isDisplayed;
        })
        .catch(() => {
          return true;
        });
    }, 2000);
    expect(helper.isTextDisplayed(addedUser));
    expect(helper.isTextDisplayed(fullName));
  });

  it('should reject passwords shorter than 8 characters', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm('user0', 'Not Saved', 'short');
    addUserModal.submit();
    expect(errorMessagePassword.getText()).toBe('The password must be at least 8 characters long.');
  });

  it('should reject weak passwords', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm('user0', 'Not Saved', 'weakPassword');
    addUserModal.submit();
    expect(errorMessagePassword.getText()).toBe('The password is too easy to guess. Include a range of types of characters to increase the score.');
  });

  it('should reject non-matching passwords', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm('user0', 'Not Saved', '%4wbbygxkgdwvdwT65');
    element(by.id('password-confirm')).sendKeys('abc');
    addUserModal.submit();
    expect(errorMessagePassword.getText()).toBe('Passwords must match.');
  });

  it('should require password', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm('user0', 'Not Saved', '');
    addUserModal.submit();
    expect(errorMessagePassword.getText()).toBe('Password is a required field.');
  });

  it('should require username', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm('', 'Not Saved', '%4wbbygxkgdwvdwT65');
    addUserModal.submit();
    const errorMessageUserName = element.all(by.css('span.help-block.ng-binding')).get(0);
    helper.waitUntilReady(errorMessageUserName);
    expect(errorMessageUserName.getText()).toBe('User name is a required field.');
  });

  it('should require place and contact for restricted user', () => {
    usersPage.openAddUserModal();
    addUserModal.fillForm('restricted', 'Not Saved', '%4wbbygxkgdwvdwT65');
    helper.selectDropdownByText(element(by.id('type')), 'Restricted to their place');
    addUserModal.submit();
    expect(element.all(by.css('span.help-block.ng-binding')).get(1).getText()).toBe('Place is a required field.');
    expect(element.all(by.css('span.help-block.ng-binding')).get(2).getText()).toBe('Associated contact is a required field.');
  });
});
