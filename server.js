const http = require("http");
const socketIo = require("socket.io");

// 1. คลังข้อมูลจอมเวทย์ทั้งหมด
let players = {}; 

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // ตาราง Dashboard แสดงเลือดและห้องแบบ Real-time
    let rows = Object.values(players).map(p => `
        <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 12px;">🟢 Online</td>
            <td style="padding: 12px; font-weight: bold;">${p.name}</td>
            <td style="padding: 12px; color: #f43f5e; font-weight: bold;">${p.roomID}</td>
            <td style="padding: 12px;">
                <div style="width: 100px; background: #000; border-radius: 5px; overflow: hidden;">
                    <div style="width: ${p.hp}%; background: #22c55e; height: 10px;"></div>
                </div>
                <small>${p.hp}/100</small>
            </td>
        </tr>
    `).join("");

    const html = `
        <html lang="th">
        <head><meta charset="UTF-8"><title>MAGI | AS01 BATTLE SYSTEM</title></head>
        <body style="font-family:sans-serif; background:#0f172a; color:white; padding:20px; display:flex; justify-content:center;">
            <div style="width:100%; max-width:650px; background:#1e293b; padding:25px; border-radius:20px;">
                <h1 style="color:#f43f5e; text-align:center;">🪄 MAGI AS01 DASHBOARD</h1>
                <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:20px; text-align:center;">
                    <span>Server Status: <b style="color:#22c55e;">ONLINE</b></span> | 
                    <span>Total Mages: <b>${Object.keys(players).length}</b></span>
                </div>
                <table style="width:100%; border-collapse:collapse;">
                    <thead><tr style="color:#94a3b8; text-align:left;"><th>Status</th><th>Name</th><th>Server</th><th>HP</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="text-align:center; padding:20px;">Waiting for mages...</td></tr>'}</tbody>
                </table>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

const io = socketIo(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    // [JOIN] - ดึงทุกคนเข้าห้อง AS01 และเซ็ตเลือด 100
    socket.on("join-game", (data) => {
        const roomID = "AS01"; 
        socket.join(roomID);

        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100, // เลือดเริ่มต้น
            roomID: roomID
        };

        socket.emit("current-players", Object.fromEntries(
            Object.entries(players).filter(([id, p]) => p.roomID === roomID)
        ));
        socket.to(roomID).emit("player-joined", players[socket.id]);
        console.log(`✨ ${players[socket.id].name} joined AS01`);
    });

    // [MOVE] - ส่งพิกัดในห้อง AS01
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            socket.to("AS01").emit("player-moved", { id: socket.id, pos: data.pos });
        }
    });

    // [COMBAT] - ระบบยิงเวทและลดเลือด
    socket.on("cast-spell", (data) => {
        // data ประกอบด้วย targetID และ damage
        const target = players[data.targetID];
        if (target) {
            target.hp -= data.damage || 10; // หักดาเมจ (ค่าเริ่มต้น 10)
            if (target.hp < 0) target.hp = 0;

            // 1. บอกคนโดนยิงว่า "นายโดนดาเมจนะ"
            io.to(data.targetID).emit("receive-damage", { newHP: target.hp, attacker: socket.id });

            // 2. บอกทุกคนใน AS01 ให้อัปเดตหลอดเลือดเพื่อน
            io.to("AS01").emit("update-player-hp", { id: data.targetID, hp: target.hp });

            // 3. บอกทุกคนให้เล่น Effect การยิง
            io.to("AS01").emit("player-cast-spell", {
                attackerID: socket.id,
                targetID: data.targetID,
                spellType: data.spellType || "magic_bolt"
            });
        }
    });

    // [DISCONNECT]
    socket.on("disconnect", () => {
        if (players[socket.id]) {
            io.to("AS01").emit("player-left", socket.id);
            delete players[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 MAGI Battle Server AS01 Live!");
});
                <h1>🪄 MAGI DASHBOARD</h1>
                <div class="status-box">
                    <span>Server ID: <b style="color: #f43f5e;">AS01</b></span> | 
                    <span>จอมเวทย์ออนไลน์: <b>${Object.keys(players).length}</b></span>
                </div>
                <table>
                    <thead><tr><th>สถานะ</th><th>ชื่อ</th><th>รหัสเซิร์ฟ</th><th>HP</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">รอการเชื่อมต่อจากจอมเวทย์...</td></tr>'}</tbody>
                </table>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    // ระบบดึงทุกคนเข้า AS01 โดยอัตโนมัติ
    socket.on("join-game", (data) => {
        const roomID = "AS01"; // บังคับเข้าห้องนี้เท่านั้น
        socket.join(roomID);

        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100,
            roomID: roomID
        };

        // ส่งข้อมูลเพื่อนที่อยู่ใน AS01 ให้ผู้เล่นใหม่
        const playersInAS01 = Object.fromEntries(
            Object.entries(players).filter(([id, p]) => p.roomID === roomID)
        );
        socket.emit("current-players", playersInAS01);

        // แจ้งทุกคนใน AS01 ว่ามีคนมาเพิ่ม
        socket.to(roomID).emit("player-joined", players[socket.id]);
        
        console.log(`✨ ${players[socket.id].name} connected to AS01`);
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            // ส่งตำแหน่งให้เฉพาะคนในห้อง AS01
            socket.to("AS01").emit("player-moved", { id: socket.id, pos: data.pos });
        }
    });

    socket.on("disconnect", () => {
        if (players[socket.id]) {
            delete players[socket.id];
            io.to("AS01").emit("player-left", socket.id);
        }
    });
});

// บรรทัดสำคัญที่ห้ามลบเด็ดขาด
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 Server AS01 is Live!");
});
