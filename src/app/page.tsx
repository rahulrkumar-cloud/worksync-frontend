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

interface Message {
  text: string;
  senderId: string;
}

interface User {
  id: string;
  name: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const { token, isAuthenticated, user } = useAuth();
  const currentUserId = user?.id || "";

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io("https://worksync-socket.onrender.com", { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.emit("register", currentUserId);

    newSocket.on("privateMessage", (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
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
        const data: User[] = await res.json(); // ✅ Explicitly type data as User[]
  
        // Convert user IDs to strings
        setUsers(data.map((user) => ({ ...user, id: String(user.id) }))); // ✅ No TypeScript error
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
    setMessages((prevMessages) => [...prevMessages, msgData]);
    setMessage("");
  };
  console.log("Logged-in User ID:", currentUserId);
  console.log("Logged-in User ID:", users);
  const loggedInUserId = String(currentUserId);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 text-white p-4">
        <h2 className="text-lg font-semibold mb-4">Chats</h2>
        <ul>
  {users
    .filter(u => u.id !== loggedInUserId) // ✅ Compare strings correctly
    .map(user => (
      <li key={user.id} 
          className={`p-3 cursor-pointer ${selectedUser === user.id ? 'bg-gray-700' : ''}`} 
          onClick={() => setSelectedUser(user.id)}>
        {user.name}
      </li>
    ))
  }
</ul>
      </div>
      
      {/* Chat Section */}
      <div className="flex flex-col w-3/4 h-full bg-gray-100">
        <div className="bg-gray-800 text-white p-4 font-semibold">Chat with {selectedUser ? users.find(u => u.id === selectedUser)?.name || "Unknown" : "Select a user"}</div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, index) => {
            const sender = users.find(u => u.id === msg.senderId);


            return (
              <div 
                key={index} 
                className={`p-2 rounded-lg max-w-xs ${msg.senderId === currentUserId ? 'ml-auto bg-green-500 text-white text-right' : 'mr-auto bg-white text-black text-left'} flex flex-col`}
              >
                <span className="text-xs text-gray-500 mb-1">{sender ? sender.name : msg.senderId}</span>
                {msg.text}
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-white border-t flex items-center">
          <input
            type="text"
            className="flex-1 p-2 border rounded-lg focus:outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="ml-2 bg-green-500 text-white p-2 rounded-lg" onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}


