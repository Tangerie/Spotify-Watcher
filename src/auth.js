import SpotifyWebApi from 'spotify-web-api-node';
import { SCOPES, GLOBAL_PREFIX } from './constants.js';

import open from "open";
import prompt from 'prompt';
import { getDatabase } from './database.js';
import buddylist from "spotify-buddylist";

const PREFIX = GLOBAL_PREFIX + "cfg_";

prompt.start();

export async function refreshBuddyToken() {
    const b = await buddylist.getWebAccessToken(spdccookie);
    global.accessToken = b.accessToken;
}

/**
 * @returns {SpotifyWebApi}
 */
export async function getAuthedSpotify () {

    const auth_db = getDatabase(0);
    await auth_db.connect();

    let spdc;

    if (!(spdc = await auth_db.get(PREFIX + "spdccookie"))) {
        spdc = (await prompt.get(["SPDC"])).SPDC
        await auth_db.set(PREFIX + "spdccookie", spdc);
    }

    global.spdccookie = spdc;
    refreshBuddyToken();

    const spotify = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        accessToken: await auth_db.get(PREFIX + "spotify_access"),
        refreshToken: await auth_db.get(PREFIX + "spotify_refresh")
    });

    console.log("Refreshing");
    // Check if tokens are valid
    const response = await spotify.refreshAccessToken().catch(async e => {
        const [access, refresh] = await doManualAuth(spotify);
        await auth_db.set(PREFIX + "spotify_access", access);
        await auth_db.set(PREFIX + "spotify_refresh", refresh);
    });

    if(response) {
        spotify.setAccessToken(response.body.access_token);
        spotify.setRefreshToken(response.body.refresh_token);
        
        await auth_db.set(PREFIX + "spotify_access", response.body.access_token);

        if(response.body.refresh_token) {
            await auth_db.set(PREFIX + "spotify_refresh", response.body.refresh_token);
        }
    }

    await auth_db.disconnect();

    return spotify;
}

/**
 * 
 * @param {SpotifyWebApi} spotify 
 */
async function doManualAuth(spotify) {
    await open(spotify.createAuthorizeURL(SCOPES, "", false));

    const code = new URL((await prompt.get(["URL"])).URL).searchParams.get("code");
    
    return new Promise((resolve, reject) => {
        spotify.authorizationCodeGrant(code).then(
            data => {
                spotify.setAccessToken(data.body["access_token"]);
                spotify.setRefreshToken(data.body["refresh_token"]);

                console.log("Authenticated");

                resolve([data.body["access_token"], data.body["refresh_token"]]);
            },
            error => {
                reject(error);
            }
        );
    })

    


}