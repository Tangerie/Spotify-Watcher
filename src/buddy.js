import prompt from 'prompt';
import buddylist from "spotify-buddylist";

prompt.start();

export async function refreshBuddyToken() {
    const b = await buddylist.getWebAccessToken(spdccookie);
    global.accessToken = b.accessToken;
    
    global.spotify.setAccessToken(global.accessToken);
}

export async function authBuddylist() {
    let spdc;

    if (!(spdc = await redis.get(process.env.REDIS_AUTH_PREFIX + "spdccookie"))) {
        spdc = (await prompt.get(["SPDC"])).SPDC
        await redis.set(process.env.REDIS_AUTH_PREFIX + "spdccookie", spdc);
    }

    global.spdccookie = spdc;
    await refreshBuddyToken();
}