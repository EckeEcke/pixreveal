export const ROOM_ID_LENGTH = 4;

export const generateRoomId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRTVWXY346789";
  let result = "";

  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return result;
};
