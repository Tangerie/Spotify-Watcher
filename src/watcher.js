import buddylist from "spotify-buddylist";
import { refreshBuddyToken } from "./auth.js";
import { GLOBAL_PREFIX } from "./constants.js";


export async function Watcher() {
    refreshBuddyToken();

    const users = await buddylist.getFriendActivity(accessToken);
    
    for(const user of users.friends) {
        if(!user?.track?.uri) continue;

        const current_last = await redis.lRange(user.user.uri, -1, -1);
        if(current_last.length == 0 || JSON.parse(current_last[0]).uri != user.track.uri) {
            console.log(`${user.user.name} is now listening to ${user.track.name}`);

            await redis.rPush(user.user.uri, JSON.stringify(user.track));
        }
    }

    if(!me) {
        global.me = await spotify.getMe().catch(e => null);
        return;
    };

    const myListening = await spotify.getMyCurrentPlaybackState().catch(e => null);
    
    if(!myListening) {
        console.log("Failed to API");
        return;
    };
    
    if(!myListening.body?.item?.uri) return;
    
    const current_last = await redis.lRange(me.body.uri, -1, -1);

    if(current_last.length == 0 || JSON.parse(current_last[0]).uri != myListening.body.item.uri) {
        console.log(`${me.body.display_name} is now listening to ${myListening.body.item.name}`);

        await redis.rPush(me.body.uri, JSON.stringify({
            ...myListening.body.item,
            context: myListening.body.context,
        }));

	await spotify.addTracksToPlaylist("6bELO4z5QWd5Ipjl5T983E", [myListening.body.item.uri]).catch(e => null);
    }
}
