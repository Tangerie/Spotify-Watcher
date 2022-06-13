
import dotenv from "dotenv";
import { Watcher } from "./watcher.js";
import { ALL_SCOPES, createSpotifyClient } from "@tangerie/spotify-manager";
import { createClient } from "redis";
import { authBuddylist } from "./buddy.js";

dotenv.config();

global.redis = createClient({
    url: process.env.REDIS_SERVER
});

redis.connect();

global.spotify = await createSpotifyClient(redis, ALL_SCOPES);

await authBuddylist();

await redis.select(process.env.REDIS_DB_NUM);

global.me = (await spotify.getMe()).body;

await Watcher();

setInterval(async () => {
    
    await Watcher();

}, 60 * 1000);



// Pause Execution
process.stdin.resume();