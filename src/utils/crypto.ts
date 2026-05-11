export const generateRoomId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRTVWXY346789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return result;
};
