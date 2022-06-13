import { getDatabase } from "./database.js";
import { getAuthedSpotify } from './auth.js';

import dotenv from "dotenv";
import { Watcher } from "./watcher.js";
import buddyList from "spotify-buddylist";
import { asyncSleep } from "./util.js";

dotenv.config();

const spotify = await getAuthedSpotify();
global.spotify = spotify;

global.me = await spotify.getMe();

await asyncSleep(1000);

global.redis = getDatabase(1);
await redis.connect();

await Watcher();
await redis.disconnect();   

setInterval(async () => {
    await redis.connect();
    
    await Watcher();

    await redis.disconnect();
}, 60 * 1000);



// Pause Execution
process.stdin.resume();