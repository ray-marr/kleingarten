// negligible chance of collision with millions of slugs
export const generateRandomSlug = (): string => {
  const allowedChars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomString = Array.from({ length: 8 }, () =>
    allowedChars.charAt(Math.floor(Math.random() * allowedChars.length)),
  ).join("");
  return randomString;
};
