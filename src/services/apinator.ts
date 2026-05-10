import { Apinator } from "@apinator/client";

export const createApinatorClient = (userData: any) => {
  const headers: Record<string, string> = {
    "x-player-username": encodeURIComponent(String(userData.username ?? "")),
    "x-player-avatar": String(userData.avatarIndex ?? 0),
    "x-player-id": String(userData.playerId ?? ""),
    "x-player-host": String(!!userData.isHost),
  };

  if (userData.rounds !== undefined && userData.rounds !== null) {
    headers["x-player-rounds"] = String(userData.rounds);
  }
  if (userData.revealTime !== undefined && userData.revealTime !== null) {
    headers["x-player-duration"] = String(userData.revealTime);
  }

  return new Apinator({
    appKey: import.meta.env.VITE_APINATOR_KEY,
    cluster: "eu",
    authEndpoint: "/api/apinator-auth",
    authHeaders: headers,
  });
};
