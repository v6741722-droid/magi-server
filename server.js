const io = require("socket.io")(process.env.PORT || 3000, {
    cors: {
        origin: "*", // อนุญาตให้ Netlify ของคุณเชื่อมต่อเข้ามาได้
        methods: ["GET", "POST"]
    }
});

// เก็บข้อมูลผู้เล่นทั้งหมดในรูปแบบ { socketId: { ข้อมูลผู้เล่น } }
let players = {};

console.log("🪄 MAGI Server is starting...");

io.on("connection", (socket) => {
    console.log(`✨ จอมเวทย์เข้าสู่เซิร์ฟเวอร์: ${socket.id}`);

    // 1. เมื่อผู้เล่นกดเข้าเกมจากหน้า Lobby
    socket.on("join-game", (data) => {
        // บันทึกข้อมูลผู้เล่นลงในหน่วยความจำของ Server
        players[socket.id] = {
            id: socket.id,
            name: data.name || "Unknown Mage",
            pos: data.pos || { x: 0, y: 15, z: 0 },
            rotY: data.rotY || 0,
            anim: "idle",
            hp: 100
        };

        // ส่งข้อมูลผู้เล่นคนอื่นที่มีอยู่แล้วกลับไปให้ "ผู้เล่นใหม่"
        socket.emit("current-players", players);

        // บอก "คนอื่นๆ" ในเซิร์ฟเวอร์ว่ามีคนใหม่เข้ามาแล้ว
        socket.broadcast.emit("player-joined", players[socket.id]);
        
        console.log(`📝 ${players[socket.id].name} ได้เริ่มการเดินทางแล้ว`);
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
