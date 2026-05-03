const http = require("http");
const socketIo = require("socket.io");

// เก็บข้อมูลผู้เล่นทั้งหมด
let players = {}; 

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // สร้างตารางรายชื่อผู้เล่นที่ถูกดึงเข้าห้อง AS01
    let rows = Object.values(players).map(p => `
        <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 12px;">🟢 Online</td>
            <td style="padding: 12px; font-weight: bold;">${p.name || 'Mage'}</td>
            <td style="padding: 12px; color: #f43f5e; font-weight: bold;">${p.roomID}</td>
            <td style="padding: 12px;">${p.hp || 100}%</td>
        </tr>
    `).join("");

    const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>MAGI | AS01 DASHBOARD</title>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; display: flex; justify-content: center; }
                .container { width: 100%; max-width: 650px; background: #1e293b; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #f43f5e; text-align: center; margin-bottom: 5px; }
                .status-box { background: #0f172a; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #334155; text-align: center; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 12px; border-bottom: 2px solid #334155; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="container">
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
