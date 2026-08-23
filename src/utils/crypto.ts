export const ROOM_ID_LENGTH = 5;

export type ApinatorCluster = "us" | "eu";

const CLUSTER_PREFIXES: Record<ApinatorCluster, string> = {
  us: "U",
  eu: "E",
};

export const generateRoomId = (cluster: ApinatorCluster) => {
  const alphabet = "ABCDEFGHJKLMNPQRTVWXY346789";
  let result = "";

  for (let i = 0; i < ROOM_ID_LENGTH - 1; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return `${CLUSTER_PREFIXES[cluster]}${result}`;
};

export const parseClusterFromRoomId = (roomId: string): ApinatorCluster => {
  return roomId.startsWith(CLUSTER_PREFIXES.us) ? "us" : "eu";
};