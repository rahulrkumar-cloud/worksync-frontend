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
import { Box, TextField, Button, Typography } from "@mui/material";
import { io, Socket } from "socket.io-client";

// Define message type
interface Message {
  text: string;
  sender: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const newSocket = io("https://worksync-socket.onrender.com", {
      transports: ["websocket"], // ✅ Ensure WebSocket transport
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
    });

    // ✅ Listen for messages
    newSocket.on("message", (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (!message.trim() || !socket) return;

    const msgData = { text: message, sender: socket.id };

    socket.emit("message", msgData); // ✅ Send message to server

    setMessage(""); // ✅ Clear input field
  };

  return (
    <Box sx={{ p: 2, width: "400px", mx: "auto", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>Chat Room</Typography>

      <Box sx={{ height: "300px", overflowY: "auto", border: "1px solid gray", p: 2, mb: 2 }}>
        {messages.map((msg, index) => (
          <Typography key={index} sx={{ textAlign: msg.sender === socket?.id ? "right" : "left" }}>
            <strong>{msg.sender === socket?.id ? "You" : "User"}:</strong> {msg.text}
          </Typography>
        ))}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleSendMessage}
        sx={{ mt: 2 }}
      >
        Send
      </Button>
    </Box>
  );
}
