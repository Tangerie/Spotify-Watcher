import { RedisClientType } from "@redis/client";
import { getFriendActivity } from "spotify-buddylist";
import SpotifyWebApi from "spotify-web-api-node";

declare global {
    var spotify : SpotifyWebApi;
    var redis : RedisClientType;
    var accessToken : string;
    var spdccookie : string;
}



export interface UserListen {
    timestamp : number;
    user : {
        uri : string,
        name : string,
        imageUrl : string
    },
    track: {
        uri : string;
        name : string;
        imageUrl : string;
        album : {
            uri : string;
            name : string;
        },
        artist : {
            uri : string;
            name : string
        },
        context : {
            url : string;
            name : string;
            index : number
        }
    }
}

export interface FriendsResponse { 
    friends : UserListen[]
}

declare module "spotify-buddylist" {
    function getFriendActivity(token : string) : Promise<FriendsResponse>;

    export = { getFriendActivity };
}