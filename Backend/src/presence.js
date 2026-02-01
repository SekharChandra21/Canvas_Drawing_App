import { users } from "./userRegistry.js";


export function markActive(socketId){
    const u = users.get(socketId);
    if(!u) return;
    u.lastActive = Date.now();
    u.status = "online";
    u.presenceColor = "green";
}


export function startPresenceEngine(io){
    setInterval(()=>{
        const now = Date.now();
        users.forEach(u=>{
            if(now - u.lastActive > 10000){
                u.status = "idle";
                u.presenceColor = "yellow";
            }
        });
        io.emit("users:update", [...users.values()]);
    },3000);
}