// "use client";

// import { useEffect, useState } from "react";
// import { 
//   List, ListItem, ListItemText, Typography, 
//   CircularProgress, Box, Button 
// } from "@mui/material";
// import { useRouter } from "next/navigation";
// import {API_BASE_URL} from "@/config/api";
// import { useAuth } from "@/context/TokenProvider"; // ✅ Token context
// import { destroyCookie } from "nookies";

// interface User {
//   id: number;
//   name: string;
//   email: string;
// }

// export default function Home() {
//   const { token, setToken,isAuthenticated } = useAuth(); // ✅ Get token and setToken
//   const router = useRouter();
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   console.log("isAuthenticated",isAuthenticated)

//   useEffect(() => {
//     if (!token) return; // ✅ Wait until token is available

// const fetchUsers = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     const res = await fetch(`${API_BASE_URL}/users`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`, // ✅ Use latest token
//       },
//     });

//     if (!res.ok) {
//       throw new Error("Failed to fetch users");
//     }

//     const data = await res.json();
//     setUsers(data);
//   } catch (err) {
//     setError((err as Error).message);
//   } finally {
//     setLoading(false);
//   }
// };

//     fetchUsers();
//   }, [token]); // ✅ Runs only when token changes

//   const handleLogout = () => {
//     destroyCookie(null, "token");
//     setToken(null); // ✅ Remove token from context
//   };

//   if (!isAuthenticated) return <Typography>Loading authentication...</Typography>;
//   if (loading) 
//     return (
//       <Box 
//         sx={{ 
//           display: "flex", 
//           justifyContent: "center", 
//           alignItems: "center", 
//           height: "100vh" 
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );

//   if (error) return <Typography color="error">{error}</Typography>;

//   return (
//     <Box sx={{ padding: 2 }}>

//       <Typography variant="h6">User List</Typography>
//       <List>
//         {users.map((user) => (
//           <ListItem key={user.id}>
//             <ListItemText primary={user.name} secondary={user.email} />
//           </ListItem>
//         ))}
//       </List>
//     </Box>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/TokenProvider";
import { Avatar } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
interface Message {
  text: string;
  senderId: string;
}

interface User {
  id: string;
  name: string;
  username: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const { token, isAuthenticated, user } = useAuth();
  const currentUserId = String(user?.id || "");

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io("https://worksync-socket.onrender.com", { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.emit("register", currentUserId);

    newSocket.on("privateMessage", (data: Message) => {
      setMessages((prev) => ({
        ...prev,
        [String(data.senderId)]: [...(prev[String(data.senderId)] || []), data],
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();

        setUsers(data.map((user) => ({ ...user, id: String(user.id) })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleSendMessage = () => {
    if (!message.trim() || !socket || !selectedUser) return;

    const msgData: Message = {
      text: message,
      senderId: String(currentUserId),
    };

    socket.emit("privateMessage", { ...msgData, receiverId: selectedUser });
    setMessages((prev) => ({
      ...prev,
      [String(selectedUser)]: [...(prev[String(selectedUser)] || []), msgData],
    }));
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full md:flex-row flex-col">
      {/* Sidebar */}
      <div className={`md:w-1/4 w-full bg-gray-900 text-white p-4 flex-shrink-0 ${selectedUser ? 'hidden md:block' : 'block'}`}>
        <h2 className="text-lg font-semibold mb-4">Chats</h2>
        <ul className="space-y-2">
          {users.filter((u) => u.id !== currentUserId).map((user) => (
            <li
              key={user.id}
              className={`p-3 cursor-pointer rounded-lg flex items-center space-x-2 ${selectedUser === user.id ? "bg-gray-700" : "hover:bg-gray-800"}`}
              onClick={() => setSelectedUser(user.id)}
            >
              <Avatar className="bg-blue-500 text-white">{user.username.charAt(0)}</Avatar>
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      {selectedUser && (
        <div className="flex flex-col md:w-3/4 w-full h-screen bg-gray-100">
          <div className="bg-gray-800 text-white p-4 font-semibold sticky top-0 flex justify-between items-center">
            <button className="md:hidden bg-gray-700 px-3 py-1 rounded" onClick={() => setSelectedUser("")}>Back</button>
            <span>{users.find((u) => u.id === selectedUser)?.name || "Unknown"}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 h-full">
            {messages[selectedUser]?.map((msg, index) => {
              const isSentByCurrentUser = msg.senderId === currentUserId;
              return (
                <div key={index} className="relative flex">
                  <div
                    className={`relative p-3 max-w-[80%] w-fit break-words rounded-lg shadow-md ${isSentByCurrentUser
                      ? "ml-auto bg-[#d9fdd3] text-black rounded-br-none"
                      : "mr-auto bg-white text-black rounded-bl-none"
                      }`}
                  >
                    {msg.text}
                    {/* WhatsApp-style message tail */}
                    <span
                      className={`absolute bottom-0 w-2 h-2 ${isSentByCurrentUser
                        ? "-right-1 bg-[#d9fdd3] rotate-45"
                        : "-left-1 bg-white rotate-45"
                        }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>



          <div className="p-4 bg-white border-t flex items-center sticky bottom-0 w-full">
            <input
              type="text"
              className="flex-1 p-3 border rounded-lg focus:outline-none"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="ml-2 bg-green-500 text-white p-3 rounded-full flex items-center justify-center" onClick={handleSendMessage}>
              <SendIcon className="w-5 h-5" />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
