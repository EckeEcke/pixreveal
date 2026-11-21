export function getWinnerProfileId(entry) {
  const id = entry.winner?.userId || entry.userId;
  const prefix = `${entry.winner?.name}-`;
  return typeof id === "string" && id.startsWith(prefix)
    ? id.slice(prefix.length) || null
    : null;
}

export function getTopChampions(entries) {
  const profiles = new Map();
  const dates = new Set();
  const sorted = entries.filter(entry => entry.winner).slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const entry of sorted) {
    if (dates.has(entry.date)) continue;
    dates.add(entry.date);
    const profileId = getWinnerProfileId(entry);
    if (!profileId) continue;
    const existing = profiles.get(profileId);
    if (existing) existing.wins++;
    else profiles.set(profileId, { profileId, wins: 1, latest: entry });
  }

  return [...profiles.values()].sort((a, b) =>
    b.wins - a.wins || b.latest.date.localeCompare(a.latest.date) ||
    a.profileId.localeCompare(b.profileId)
  ).slice(0, 3);
}
