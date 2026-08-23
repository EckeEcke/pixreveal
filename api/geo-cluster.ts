import type { VercelRequest, VercelResponse } from "@vercel/node";

type ApinatorCluster = "us" | "eu";

const US_CLUSTER_COUNTRIES = new Set(["US", "CA", "BR", "AR", "MX"]);

const getSingle = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const country = getSingle(req.headers["x-vercel-ip-country"]);
  const cluster: ApinatorCluster =
    country && US_CLUSTER_COUNTRIES.has(country) ? "us" : "eu";

  res.status(200).json({ cluster });
}