import { UserType } from '../enums/users.enum';

function extractToken(prefix: string, authHeader: string | undefined) {
  if (authHeader && authHeader.split(' ')[0] === prefix) {
    console.log('passed');
    return authHeader.split(' ')[1];
  }

  return 'invalid-token';
}

const convertDateToString = (dateString: string, locale = 'en-US') => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

function formatUserType(type: UserType) {
  if (type === UserType.PARK_OWNER) {
    return 'Park Owner';
  }
  return type;
}

export { extractToken, convertDateToString, formatUserType };
