import { createClient } from "redis";
import { createUserArtHandler } from "../server/userArt.js";

export default createUserArtHandler({ createClient });
