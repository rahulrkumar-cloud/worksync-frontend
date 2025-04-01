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
// ChatComponent.tsx (React Component)
// ChatApp.tsx
"use client";
import { useEffect, useState } from "react";
import { Box, Typography, TextField, IconButton, Avatar, List, ListItem, ListItemText, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { io } from "socket.io-client";
import { useAuth } from "@/context/TokenProvider"; // ✅ Import the useAuth hook
import { API_BASE_URL } from "@/config/api";

const socket = io("http://localhost:3000"); // Connect to the server

interface Message {
  text: string;
  sender: string;
  recipient: string;
}

interface User {
  id: string;
  name: string;
  email: string; // Add email to user
}

const ChatApp = () => {
  const { user, token, isAuthenticated } = useAuth(); // ✅ Get user, token, and authentication status from context
  const [messages, setMessages] = useState<Message[]>([]); 
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState<string>(""); // Store the recipient username
  const [username, setUsername] = useState<string>(""); // Store the user's username
  const [users, setUsers] = useState<User[]>([]); // Store fetched users
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch the list of users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Use latest token
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      console.log("!filteredUsers",data)
      // Filter out the current logged-in user from the list of users
      const filteredUsers = data.filter((userItem: User) => userItem.email !== user?.email);      
      console.log("filteredUsers",filteredUsers)
      
      setUsers(filteredUsers); // Set the filtered users to state
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch users when the component mounts
    fetchUsers();

    // Ensure that the username is set from the user context when authenticated
    if (user?.name) {
      setUsername(user.name); // Set username from context
    }
  }, [user?.name, token]); // Runs whenever user name or token changes

  useEffect(() => {
    if (username) {
      console.log(`Emitting setUsername for ${username}`); // Debug log
      socket.emit("setUsername", username); // Emit the username to associate with socket ID
    }

    socket.on("receiveMessage", (message: Message) => {
      console.log(`Received message from ${message.sender}: ${message.text}`);
      // Only add the message if the recipient is the active chat
      if (message.recipient === activeChat || message.sender === activeChat) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [username, activeChat]); // Ensure username and activeChat are set

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;

    const newMessage: Message = {
      text: input,
      sender: username, // Ensure the sender is included
      recipient: activeChat,
    };

    console.log("newMessage:", newMessage);
    console.log(`Sending message from ${username} to ${activeChat}: ${input}`);

    // Emit the message to the server
    socket.emit("sendMessage", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
  };

  const handleChatClick = (username: string) => {
    console.log("Setting active chat to:", username); // Debug log
    setActiveChat(username);
    setMessages([]); // Clear the previous chat messages when switching chat
  };

  console.log("activeChat", activeChat); // Debug log

  return (
    <Box className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Box className="w-1/4 bg-white p-6 border-r border-gray-200 hidden md:block">
        <Typography variant="h6" className="mb-6 text-gray-800 font-semibold">Chats</Typography>
        <List>
          {/* Map over the fetched users */}
          {loading ? (
            <Typography>Loading users...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            users.map((chatUser) => (
              <ListItem
                key={chatUser.id} // Use unique user id
                component="button"
                className={`flex items-center hover:bg-gray-100 rounded-md p-2 transition ${activeChat === chatUser.name ? 'bg-blue-100' : ''}`}
                onClick={() => handleChatClick(chatUser.name)}
              >
                <Avatar className="bg-blue-500 text-white mr-3">
                  <ChatBubbleOutlineIcon />
                </Avatar>
                <ListItemText primary={chatUser.name} secondary={chatUser.email} className="text-gray-800" />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      {/* Chat Window */}
      <Box className="flex flex-col flex-1">
        {/* Chat Header */}
        <Box className="bg-white p-4 border-b border-gray-200 flex items-center shadow-md">
          {activeChat ? (
            <>
              <Avatar className="mr-3 bg-blue-500 text-white">{activeChat[0]}</Avatar>
              <Typography variant="h6" className="text-gray-800 font-semibold">{activeChat}</Typography>
            </>
          ) : (
            <Typography variant="h6" className="text-gray-800 font-semibold">Select a Chat</Typography>
          )}
        </Box>

        {/* Chat Messages */}
        <Box className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-100">
          {messages.map((msg, index) => (
            <Box
              key={index}
              className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: "1rem",
                  maxWidth: "20rem",
                  backgroundColor: msg.sender === username ? "green" : "lightgray",
                  color: msg.sender === username ? "white" : "black",
                }}
              >
                <Typography variant="body1" className="font-medium">{msg.text}</Typography>
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
};

export default ChatApp;
