//Modify this enum here if you have different user types or else delete it
enum DbUserType {
  CUSTOMER = 'customers',
  PARK_OWNER = 'parkowners'
}

enum UserType {
  CUSTOMER = 'Customer',
  PARK_OWNER = 'ParkOwner',
  ADMIN = 'Admin',
  MODERATOR = 'Moderator>'
}

enum UserConstraints {
  EMAIL_MAXLENGTH = 'Max supported length of email is 50',
  EMAIL_MAXVALUE = 50,

  /* length is higher than 50 because we store password in encrypted form */
  PASSWORD_MAXLENGTH = 'Max supported length of password is 100',
  PASSWORD_MAXVALUE = 100,

  FIRSTNAME_MAXLENGTH = 'Max supported length of firstname is 50',
  FIRSTNAME_MAXVALUE = 50,

  LASTNAME_MAXLENGTH = 'Max supported length of lastname is 50',
  LASTNAME_MAXVALUE = 50
}

enum UserErrors {
  USER_DOES_NOT_EXISTS = 'User with this email does not exists',
  USER_ALREADY_REGISTERED_AS_MEMBER = 'User is already registered as member'
}

enum UserSuccess {
  PROFILE_UPDATED = 'user profile updated',
  SUCCESSFUL_LOGIN = 'You have successfully logged in as'
}

export { UserConstraints, DbUserType, UserType, UserErrors, UserSuccess };
