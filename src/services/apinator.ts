import { Apinator } from "@apinator/client";

export const createApinatorClient = (userData: any) => {
  return new Apinator({
    appKey: import.meta.env.VITE_APINATOR_KEY,
    cluster: "eu",
    authEndpoint: "/api/apinator-auth",
    authHeaders: {
      "x-player-username": encodeURIComponent(userData.username),
      "x-player-avatar": String(userData.avatarIndex),
      "x-player-id": userData.playerId,
      "x-player-host": userData.isHost
    },
  });
};
