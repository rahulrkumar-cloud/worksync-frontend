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

//     const fetchUsers = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch(`${API_BASE_URL}/users`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`, // ✅ Use latest token
//           },
//         });

//         if (!res.ok) {
//           throw new Error("Failed to fetch users");
//         }

//         const data = await res.json();
//         setUsers(data);
//       } catch (err) {
//         setError((err as Error).message);
//       } finally {
//         setLoading(false);
//       }
//     };

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
// ChatComponent.tsx (React Component)
// ChatApp.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton, Avatar, List, ListItem, ListItemText, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { io } from "socket.io-client";  // Import socket.io-client
import { v4 as uuidv4 } from "uuid"; 
import {API_Socket_URL} from "@/config/api";
interface Message {
  id: any; // Change this to string
  text: string;
  sender: "me" | "other";
  timestamp: string;
}


interface Chat {
  id: number;
  name: string;
}

const socket = io(`${API_Socket_URL}`); // Connect to your backend server
// const socket = io("https://work-sync-backend.vercel.app");
export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello, John! How are you?", sender: "other", timestamp: "10:30 AM" },
    { id: 2, text: "I'm good, thanks! What about you?", sender: "me", timestamp: "10:31 AM" },
  ]);
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const chats: Chat[] = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Rahul Kumar" },
  ];

  // When the component mounts, set up socket listeners
  useEffect(() => {
    socket.on("receiveMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
  
    const newMessage: Message = {
      id: uuidv4() as string,  // Explicitly cast to string
      text: input,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
  
    // Emit the message to the server
    socket.emit("sendMessage", newMessage);
    setMessages([...messages, newMessage]); // Optimistic UI update
    setInput("");
  };

  const handleChatClick = (chat: Chat) => {
    setActiveChat(chat);
    setMessages([
      { id: 1, text: `Hello, ${chat.name}! How are you?`, sender: "other", timestamp: "10:30 AM" },
      { id: 2, text: `I'm good, thanks! What about you?`, sender: "me", timestamp: "10:31 AM" },
    ]);
  };

  return (
    <Box className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Box className="w-1/4 bg-white p-6 border-r border-gray-200 hidden md:block">
        <Typography variant="h6" className="mb-6 text-gray-800 font-semibold">Chats</Typography>
        <List>
          {chats.map((chat) => (
            <ListItem
              key={chat.id}
              component="button"
              className={`flex items-center hover:bg-gray-100 rounded-md p-2 transition ${activeChat?.id === chat.id ? 'bg-blue-100' : ''}`}
              onClick={() => handleChatClick(chat)}
            >
              <Avatar className="bg-blue-500 text-white mr-3">
                <ChatBubbleOutlineIcon />
              </Avatar>
              <ListItemText primary={chat.name} secondary="Hey!" className="text-gray-800" />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Window */}
      <Box className="flex flex-col flex-1">
        {/* Chat Header */}
        <Box className="bg-white p-4 border-b border-gray-200 flex items-center shadow-md">
          {activeChat ? (
            <>
              <Avatar className="mr-3 bg-blue-500 text-white">{activeChat.name[0]}</Avatar>
              <Typography variant="h6" className="text-gray-800 font-semibold">{activeChat.name}</Typography>
            </>
          ) : (
            <Typography variant="h6" className="text-gray-800 font-semibold">Select a Chat</Typography>
          )}
        </Box>

        {/* Chat Messages */}
        <Box className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-100">
        {messages.map((msg) => (
            <Box
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: "1rem",
                  maxWidth: "20rem",
                  backgroundColor: msg.sender === "me" ? "green" : "lightgray", // Dynamic background color
                  color: msg.sender === "me" ? "white" : "black",
                }}
              >
                <Typography variant="body1" className="font-medium">{msg.text}</Typography>
                <Typography variant="caption" className="block text-right text-xs mt-1 opacity-70">
                  {msg.timestamp}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Input Field */}
        <Box className="flex items-center p-4 bg-white border-t border-gray-200 mb-16 shadow-sm">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <IconButton color="primary" onClick={sendMessage} className="ml-3">
            <SendIcon className="text-blue-500" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}


