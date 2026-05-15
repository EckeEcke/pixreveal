/* import { Apinator } from "@apinator/client";

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

*/

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

  const clientInstance = new Apinator({
    appKey: import.meta.env.VITE_APINATOR_KEY,
    cluster: "eu",
    authEndpoint: "/api/apinator-auth",
    authHeaders: headers,
  });

  // THE EXPERIMENT: Wir fangen den Timer ab und setzen ihn extrem hoch
  const internalConnection = (clientInstance as any).connection;
  if (internalConnection) {
    const originalResetTimer = internalConnection.resetActivityTimer;

    internalConnection.resetActivityTimer = function (timeoutSeconds: number) {
      // Wir ignorieren das Server-Limit und setzen 600 Sekunden (10 Minuten)
      // Damit bleibt die Library für 10 Minuten komplett still und triggert kein automatisches ws.close()
      return originalResetTimer.call(this, 600);
    };
  }

  return clientInstance;
};
