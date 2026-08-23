export const ROOM_ID_LENGTH = 5;

export type ApinatorCluster = "us" | "eu";

const CLUSTER_PREFIXES: Record<ApinatorCluster, string> = {
  us: "U",
  eu: "E",
};

const ALPHABET = "ABCDEFGHJKLMNPQRTVWXY346789";

const generateRandomCode = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return result;
};

export const generateRoomId = (cluster: ApinatorCluster) => {
  return `${CLUSTER_PREFIXES[cluster]}${generateRandomCode(ROOM_ID_LENGTH - 1)}`;
};

export const parseClusterFromRoomId = (roomId: string): ApinatorCluster => {
  return roomId.startsWith(CLUSTER_PREFIXES.us) ? "us" : "eu";
};

export const generatePlayerId = () => generateRandomCode(ROOM_ID_LENGTH);