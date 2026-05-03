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
    console.log("🚀 MAGI Server is Live!");
});
