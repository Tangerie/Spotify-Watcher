import { createClient } from 'redis';

let database;

/**
 * 
 * @returns {import('redis').RedisClientType}
 */
export function getDatabase(db_id) {
    if(database) {
        return database;
    }

    const client = createClient(
        {
            url: process.env.REDIS_SERVER,
            database: db_id
        }
    );
    
    client.on('error', (err) => console.log('Redis Client Error', err));

    return client;
}