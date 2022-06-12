import buddylist from "spotify-buddylist";
import { refreshBuddyToken } from "./auth.js";
import { GLOBAL_PREFIX } from "./constants.js";


export async function Watcher() {
    refreshBuddyToken();

    const users = await buddylist.getFriendActivity(accessToken);
    
    for(const user of users.friends) {
        const current_last = await redis.lRange(user.user.uri, -1, -1);
        if(current_last.length == 0 || JSON.parse(current_last[0]).uri != user.track.uri) {
            console.log(`${user.user.name} is now listening to ${user.track.name} [${user.track.context.name}]`);

            await redis.rPush(user.user.uri, JSON.stringify(user.track));
        }
    }

    const myListening = await spotify.getMyCurrentPlaybackState();
    const me = await spotify.getMe();

    const current_last = await redis.lRange(me.body.uri, -1, -1);

    if(current_last.length == 0 || JSON.parse(current_last[0]).uri != myListening.body.item.uri) {
        console.log(`${me.body.display_name} is now listening to ${myListening.body.item.name} [${myListening.body.context.uri}]`);

        await redis.rPush(me.body.uri, JSON.stringify({
            ...myListening.body.item,
            context: myListening.body.context,
        }));
    }
}