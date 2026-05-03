const http = require("http");
const socketIo = require("socket.io");

// เก็บข้อมูลผู้เล่น
let players = {};

// 1. สร้าง Server และหน้า Dashboard สำหรับดูรายชื่อ
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // สร้างรายการ HTML ของผู้เล่น
    let rows = Object.values(players).map(p => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px;">🟢 Online</td>
            <td style="padding: 12px; font-weight: bold;">${p.name}</td>
            <td style="padding: 12px; font-family: monospace; color: #666;">${p.id}</td>
            <td style="padding: 12px;">${p.hp}%</td>
        </tr>
    `).join("");

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>MAGI | SERVER STATUS</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; margin: 0; padding: 20px; }
                .container { max-width: 800px; margin: auto; background: #1e293b; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h1 { color: #f43f5e; text-align: center; letter-spacing: 2px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #334155; border-radius: 10px; overflow: hidden; }
                th { background: #475569; padding: 15px; text-align: left; }
                .stat-card { display: flex; justify-content: space-between; margin-bottom: 20px; background: #0f172a; padding: 15px; border-radius: 10px; border: 1px solid #334155; }
                .status-dot { height: 10px; width: 10px; background-color: #22c55e; border-radius: 50%; display: inline-block; margin-right: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🪄 MAGI ONLINE DASHBOARD</h1>
                <div class="stat-card">
                    <span>สถานะเซิร์ฟเวอร์: <b>ACTIVE</b></span>
                    <span>จอมเวทย์ออนไลน์: <b style="color: #f43f5e;">${Object.keys(players).length}</b></span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>สถานะ</th>
                            <th>ชื่อผู้เล่น</th>
                            <th>Socket ID</th>
                            <th>พลังชีวิต</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">ยังไม่มีผู้เล่นออนไลน์ในขณะนี้</td></tr>'}
                    </tbody>
                </table>
                <p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 20px;">หน้าจอนี้จะรีเฟรชตัวเองอัตโนมัติทุก 5 วินาที</p>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

// 2. ตั้งค่า Socket.io
const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    console.log("New Connection:", socket.id);

    // เมื่อผู้เล่นเข้าเกม
    socket.on("join-game", (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Unknown",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            rotY: data.rotY || 0,
            anim: "idle",
            hp: 100
        };
        socket.emit("current-players", players);
        socket.broadcast.emit("player-joined", players[socket.id]);
    });

    // รับส่งข้อมูลตำแหน่ง
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            players[socket.id].rotY = data.rotY;
            players[socket.id].anim = data.anim;
            socket.broadcast.emit("player-moved", players[socket.id]);
        }
    });

    // ระบบดาเมจ
    socket.on("take-damage", (data) => {
        if (players[data.targetId]) {
            players[data.targetId].hp -= data.damage;
            if (players[data.targetId].hp <= 0) players[data.targetId].hp = 0;
            io.emit("health-update", { id: data.targetId, hp: players[data.targetId].hp });
        }
    });

    // เมื่อผู้เล่นออก
    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("player-left", socket.id);
    });
});

// 3. เริ่มรัน Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
    // 2. รับข้อมูลการเคลื่อนที่ (ส่งจากเครื่องผู้เล่น) และกระจายต่อ
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            players[socket.id].rotY = data.rotY;
            players[socket.id].anim = data.anim;

            // ส่งข้อมูลการขยับไปให้คนอื่นๆ ทุกคน (ยกเว้นตัวเอง)
            socket.broadcast.emit("player-moved", players[socket.id]);
        }
    });

    // 3. ระบบความเสียหาย (เมื่อโดน Fireball)
    socket.on("take-damage", (data) => {
        const targetId = data.targetId;
        if (players[targetId]) {
            players[targetId].hp -= data.damage;
            if (players[targetId].hp <= 0) players[targetId].hp = 0;

            // บอกทุกคนให้อัปเดตเลือดของเป้าหมาย
            io.emit("health-update", {
                id: targetId,
                hp: players[targetId].hp
            });
        }
    });

    // 4. เมื่อผู้เล่นออกจากการเชื่อมต่อ (ปิดเว็บ หรือเน็ตหลุด)
    socket.on("disconnect", () => {
        if (players[socket.id]) {
            console.log(`❌ จอมเวทย์ออกจากเกาะ: ${players[socket.id].name}`);
            delete players[socket.id];
            
            // บอกทุกคนให้ลบตัวละครตัวนี้ออกจากจอ
            io.emit("player-left", socket.id);
        }
    });
});

console.log(`🚀 Server รันอยู่ที่พอร์ต ${process.env.PORT || 3000}`);
