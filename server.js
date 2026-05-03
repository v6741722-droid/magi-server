const http = require("http");
const socketIo = require("socket.io");

// เก็บข้อมูลผู้เล่นไว้บนสุดเพื่อให้ทุกฟังก์ชันเข้าถึงได้
let players = {}; 

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // สร้างตารางรายชื่อผู้เล่นแบบ Real-time
    let rows = Object.values(players).map(p => `
        <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 12px;">🟢 Online</td>
            <td style="padding: 12px; font-weight: bold;">${p.name || 'Mage'}</td>
            <td style="padding: 12px;">${p.hp || 100}%</td>
        </tr>
    `).join("");

    const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>MAGI | SERVER STATUS</title>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; display: flex; justify-content: center; }
                .container { width: 100%; max-width: 600px; background: #1e293b; padding: 25px; border-radius: 20px; }
                h1 { color: #f43f5e; text-align: center; }
                .status-box { background: #0f172a; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #334155; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 12px; border-bottom: 2px solid #334155; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🪄 MAGI DASHBOARD</h1>
                <div class="status-box">
                    <span>สถานะ: <b style="color: #22c55e;">Online</b></span> | 
                    <span>จอมเวทย์ออนไลน์: <b>${Object.keys(players).length}</b></span>
                </div>
                <table>
                    <thead><tr><th>สถานะ</th><th>ชื่อ</th><th>HP</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="3" style="text-align:center; padding:20px; color:#94a3b8;">ไม่มีคนออนไลน์</td></tr>'}</tbody>
                </table>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

// ตั้งค่า Socket.io สำหรับรับส่งข้อมูลเกม
const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    socket.on("join-game", (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100
        };
        socket.emit("current-players", players);
        socket.broadcast.emit("player-joined", players[socket.id]);
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            socket.broadcast.emit("player-moved", { id: socket.id, pos: data.pos });
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("player-left", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 MAGI Server is Live & Healthy!");
});
                    <span>สถานะ: <b style="color: #22c55e;">Online</b></span> | 
                    <span>จอมเวทย์ออนไลน์: <b>${Object.keys(players).length}</b></span>
                </div>
                <table>
                    <thead><tr><th>สถานะ</th><th>ชื่อ</th><th>HP</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="3" style="text-align:center; padding:20px; color:#94a3b8;">ไม่มีคนออนไลน์</td></tr>'}</tbody>
                </table>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

// ตั้งค่า Socket.io และเปิด CORS ให้เชื่อมต่อจาก Netlify ได้
const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    socket.on("join-game", (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100
        };
        socket.emit("current-players", players);
        socket.broadcast.emit("player-joined", players[socket.id]);
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            socket.broadcast.emit("player-moved", { id: socket.id, pos: data.pos });
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("player-left", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 Server is Live!");
});
                <h1>🪄 MAGI DASHBOARD</h1>
                <div class="status-box">
                    <span>สถานะ: <b style="color: #22c55e;">Online</b></span> | 
                    <span>จอมเวทย์ออนไลน์: <b>${Object.keys(players).length}</b></span>
                </div>
                <table>
                    <thead><tr><th>สถานะ</th><th>ชื่อ</th><th>HP</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="3" style="text-align:center; padding:20px; color:#94a3b8;">ไม่มีคนออนไลน์ในขณะนี้</td></tr>'}</tbody>
                </table>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

// 2. ตั้งค่า Socket.io พร้อมเปิด CORS ให้เชื่อมต่อจาก Netlify ได้
const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    // เมื่อมีผู้เล่น Join
    socket.on("join-game", (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100
        };
        socket.emit("current-players", players);
        socket.broadcast.emit("player-joined", players[socket.id]);
        console.log(`Mage joined: ${players[socket.id].name}`);
    });

    // เมื่อผู้เล่นเคลื่อนที่
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            socket.broadcast.emit("player-moved", { id: socket.id, pos: data.pos });
        }
    });

    // เมื่อผู้เล่นออกจากเกม
    socket.on("disconnect", () => {
        if (players[socket.id]) {
            console.log(`Mage left: ${players[socket.id].name}`);
            delete players[socket.id];
            io.emit("player-left", socket.id);
        }
    });
});

// 3. เริ่มรัน Server บน Port ที่ Render กำหนด
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 MAGI Server is Live & Healthy!");
});
                    <tbody>${rows || '<tr><td colspan="3" style="text-align:center; padding:20px;">ไม่มีคนออนไลน์</td></tr>'}</tbody>
                </table>
            </div>
            <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
        </html>
    `;
    res.end(html);
});

// 2. ตั้งค่า Socket.io สำหรับรับส่งข้อมูลเกม
const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on("connection", (socket) => {
    socket.on("join-game", (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100
        };
        socket.emit("current-players", players);
        socket.broadcast.emit("player-joined", players[socket.id]);
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            socket.broadcast.emit("player-moved", { id: socket.id, pos: data.pos });
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("player-left", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 MAGI Server is Live!");
});
io.on("connection", (socket) => {
    socket.on("join-game", (data) => {
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            hp: 100
        };
        socket.emit("current-players", players);
        socket.broadcast.emit("player-joined", players[socket.id]);
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].pos = data.pos;
            socket.broadcast.emit("player-moved", { id: socket.id, ...data });
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("player-left", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("🚀 MAGI Server is Live!");
});
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
