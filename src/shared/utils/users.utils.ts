function generateRandomTextAndLength() {
  const minLength = 7;
  const maxLength = 15;
  const length = Math.floor(
    Math.random() * (maxLength - minLength + 1) + minLength
  );

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomText = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomText += characters.charAt(randomIndex);
  }

  return { text: randomText, length };
}

export function appendRandomTextAndLength(parameter: string) {
  const { text, length } = generateRandomTextAndLength();
  return `${text}/${parameter}%${length}`;
}

function getExpirationTime(minutes: number) {
  const currentTime = new Date().getTime();
  const expirationTime = currentTime + minutes * 60000; // 1 minute = 60000 milliseconds
  return expirationTime;
}

export { getExpirationTime };
