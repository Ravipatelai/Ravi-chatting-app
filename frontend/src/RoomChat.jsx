import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

const socket = io("https://backend-chat-ochre.vercel.app/");

export default function RoomChat() {
  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [players, setPlayers] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  const [showRoomId, setShowRoomId] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  useEffect(() => {
    socket.on("player-list", (playerList) => setPlayers(playerList));
    socket.on("chat-message", ({ sender, message }) =>
      setChat((prev) => [...prev, { sender, message }])
    );

    return () => {
      socket.off("player-list");
      socket.off("chat-message");
    };
  }, []);

  const createRoom = () => {
    if (!username.trim()) return alert("Enter your name");
    socket.emit("create-room", { name: username }, (res) => {
      setJoinedRoom(res.roomId);
      setRoomId(res.roomId);
    });
  };

  const joinRoom = () => {
    if (!username.trim() || !roomId.trim())
      return alert("Enter name & room ID");
    socket.emit("join-room", { roomId, name: username }, (res) => {
      if (res.success) setJoinedRoom(roomId);
      else alert(res.message);
    });
  };

  const leaveRoom = () => {
    if (!joinedRoom) return;
    socket.emit("leave-room", { roomId: joinedRoom, name: username }, (res) => {
      if (res.success) {
        setJoinedRoom("");
        setPlayers([]);
        setChat([]);
        setRoomId("");
      }
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !joinedRoom) return;
    socket.emit("chat-message", {
      roomId: joinedRoom,
      sender: username,
      message,
    });
    setMessage("");
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    
  };

  // framer-motion variants
  const titleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  const logoPulse = {
    rest: { scale: 1 },
    hover: { scale: 1.08, rotate: [0, 3, -3, 0], transition: { duration: 0.6 } },
    tap: { scale: 0.96 },
  };

  const btnTap = { scale: 0.97 };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {!joinedRoom && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full text-center">
          {/* Animated Title + small animated logo */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={titleVariants}
            className="mb-6 flex flex-col items-center"
          >
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-3 shadow-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xl font-bold"
              variants={logoPulse}
              whileHover="hover"
              whileTap="tap"
              initial="rest"
              animate="rest"
            >
              RC
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-blue-600"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45 }}
            >
              Ravi Chatting App
            </motion.h1>

            <motion.p
              className="text-sm text-gray-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              Made with ❤️ by Ravi
            </motion.p>
          </motion.div>

          {/* Name Input */}
          <motion.input
            type="text"
            placeholder="Enter your name"
            className="border p-2 rounded w-full max-w-md mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          />

          {/* Room ID + Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <motion.button
              onClick={createRoom}
              className="px-4 py-2 bg-green-600 text-white rounded-lg w-full sm:w-auto cursor-pointer shadow-sm"
              whileTap={btnTap}
              whileHover={{ y: -2 }}
            >
              Create Room
            </motion.button>

            <motion.input
              type="text"
              placeholder="Room ID"
              className="border p-2  rounded flex-1"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
            />

            <motion.button
              onClick={joinRoom}
              className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg w-full sm:w-auto shadow-sm"
              whileTap={btnTap}
              whileHover={{ y: -2 }}
            >
              Join Room
            </motion.button>
          </div>
        </div>
      )}

      {joinedRoom && (
        <div className="flex flex-col w-full h-full">
          {/* 🔝 Header / Controls */}
          <div className="p-2 bg-gray-200 flex gap-2 w-full">
            <button
              className="px-3 py-1 bg-gray-700 text-white cursor-pointer rounded"
              onClick={() => setShowRoomId(!showRoomId)}
            >
              {showRoomId ? "Hide Room ID" : "Show Room ID"}
            </button>
            <button
              className="px-3 py-1 cursor-pointer bg-gray-700 text-white rounded"
              onClick={() => setShowPlayers(!showPlayers)}
            >
              {showPlayers ? "Hide Name" : "Show Name"}
            </button>
            <button
              onClick={leaveRoom}
              className="px-3 py-1 bg-red-600 text-white cursor-pointer rounded"
            >
              Leave Room
            </button>
          </div>

          {showRoomId && (
            <div className="flex items-center gap-2 p-2 bg-white w-full">
              <div className="bg-gray-200 p-2 rounded flex-1">
                Room ID: {joinedRoom}
              </div>
              <button
                onClick={() => copyToClipboard(joinedRoom, "Room ID")}
                className="px-2 py-1 bg-blue-600  text-white rounded"
              >
                Copy
              </button>
            </div>
          )}

          {showPlayers && (
            <div className="bg-gray-100 p-2 rounded mt-1 w-full">
              <ul className="list-disc pl-6">
                {players.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 💬 Chat Area */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col">
            {chat.map((c, i) => {
              const isMe = c.sender === username;
              return (
                <div
                  key={i}
                  className={`px-2 py-1 rounded-lg max-w-[80%] mb-1 ${
                    isMe
                      ? "bg-blue-500 text-white self-end"
                      : c.sender === "System"
                      ? "bg-gray-300 text-gray-800 self-start italic"
                      : "bg-green-200 text-gray-800 self-start"
                  }`}
                >
                  {c.sender !== "System" && !isMe && <b>{c.sender}: </b>}
                  {c.message}
                </div>
              );
            })}
          </div>

          {/* ⌨️ Input Fixed Bottom */}
          <div className="p-2 bg-white flex gap-2 border-t w-full pb-[env(safe-area-inset-bottom)] mb-4">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border p-2 rounded"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <motion.button
              className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded"
              onClick={sendMessage}
              whileTap={{ scale: 0.97 }}
            >
              Send
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
