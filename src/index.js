import { getDatabase } from "./database.js";
import { getAuthedSpotify } from './auth.js';

import dotenv from "dotenv";
import { Watcher } from "./watcher.js";
import buddyList from "spotify-buddylist";

dotenv.config();

const spotify = await getAuthedSpotify();
global.spotify = spotify;

setInterval(async () => {
    global.redis = getDatabase(1);
    await redis.connect();
    
    await Watcher();

    await redis.disconnect();
}, 5 * 1000);



// Pause Execution
process.stdin.resume();