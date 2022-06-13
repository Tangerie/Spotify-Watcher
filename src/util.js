export async function asyncSleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    })
}