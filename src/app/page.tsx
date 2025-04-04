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
import { Avatar, Box, List, ListItem, ListItemText, TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
//     <Box sx={{ display: "flex", height: "100vh", flexDirection: { xs: "column", md: "row" } }}>
//   {/* Sidebar (Chats list) */}
//   <Box
//   sx={{
//     width: { md: "25%", xs: "100%" },
//     bgcolor: "background.default",
//     borderRight: 1,
//     borderColor: "divider",
//     position: "relative",
//     marginTop: { xs: "10%",sm:"6%", md: "5%",lg:"4%",xl:"2%" },  // marginTop adjusts based on screen size
//     display: { xs: selectedUser ? "none" : "block", md: "block" }, // Hide sidebar on small screens when chat is selected
//   }}
// >
//     <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
//       <h2>Chats</h2>
//     </Paper>
//     <Box
//       sx={{
//         height: "calc(100vh - 120px)", // Adjusting height to account for header
//         overflowY: "auto",
//         position: "absolute",
//         top: "64px", // Space for the header
//         width: "100%",
//       }}
//     >
//       <List>
//         {users
//           .filter((user) => user.id !== currentUserId)
//           .map((user) => (
//             <ListItem
//               key={user.id}
//               sx={{
//                 cursor: "pointer",
//                 bgcolor: selectedUser === user.id ? "gray.200" : "transparent",
//                 "&:hover": { bgcolor: "gray.100" },
//               }}
//               onClick={() => setSelectedUser(user.id)}
//             >
//               <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
//                 {user.username.charAt(0)}
//               </Avatar>
//               <ListItemText primary={user.username} />
//             </ListItem>
//           ))}
//       </List>
//     </Box>
//   </Box>

//   {/* Chat Section */}
//   {selectedUser && (
//     <Box
//       sx={{
//         flex: 1,
//         display: "flex",
//         flexDirection: "column",
//         bgcolor: "background.paper",
//         borderLeft: 1,
//         borderColor: "divider",
//         position: "relative",
//         height: "100vh", // Ensure full page height
//       }}
//     >
//       {/* Chat Header */}
//       <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white", position: "sticky", top: 0, zIndex: 1 }}>
//         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",marginTop: { xs: "10%",sm:"8%", md: "8%",lg:"6%",xl:"4%" }, }}>
//           <IconButton color="inherit" onClick={() => setSelectedUser("")} sx={{ display: { md: "none" } }}>
//             <ChevronLeftIcon fontSize="large"/>
//           </IconButton>
//           <span>{users.find((u) => u.id === selectedUser)?.name || "Unknown"}</span>
//         </Box>
//       </Paper>

//       {/* Chat Messages */}
//       <Box
//         sx={{
//           flex: 1,
//           p: 2,
//           overflowY: "auto",
//           position: "relative",
//           top: "0px", // Space for the header
//           bottom: "0px", // Space for the input box
//           width: "auto",
//         }}
//       >
//         {messages[selectedUser]?.map((msg, index) => {
//           const isSentByCurrentUser = msg.senderId === currentUserId;
//           return (
//             <Box
//               key={index}
//               sx={{
//                 display: "flex",
//                 justifyContent: isSentByCurrentUser ? "flex-end" : "flex-start",
//                 mb: 2,
//               }}
//             >
//               <Paper
//                 sx={{
//                   p: 2,
//                   maxWidth: "80%",
//                   bgcolor: isSentByCurrentUser ? "primary.main" : "grey.200",
//                   color: isSentByCurrentUser ? "white" : "black",
//                   borderRadius: "16px",
//                   boxShadow: 2,
//                 }}
//               >
//                 {msg.text}
//               </Paper>
//             </Box>
//           );
//         })}
//       </Box>

//       {/* Input and Send Button */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           p: 2,
//           position: "sticky",
//           bottom: 0,
//           bgcolor: "background.default",
//           borderTop: 1,
//           borderColor: "divider",
//           zIndex: 1,
//         }}
//       >
//         <TextField
//           fullWidth
//           variant="outlined"
//           size="small"
//           placeholder="Type a message..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />
//         <IconButton color="primary" onClick={handleSendMessage}>
//           <SendIcon />
//         </IconButton>
//       </Box>
//     </Box>
//   )}
// </Box>

 <Box className="p-0 rounded-lg mt-0 h-screen fixed top-13 left-0 right-0 ">
   <Box sx={{ display: "flex", height: "100vh", flexDirection: { xs: "column", md: "row" } }}>
  {/* Sidebar (Chats list) */}
  <Box
  sx={{
    width: { md: "25%", xs: "100%" },
    bgcolor: "background.default",
    borderRight: 1,
    borderColor: "divider",
    position: "relative",
      // marginTop adjusts based on screen size
    display: { xs: selectedUser ? "none" : "block", md: "block" }, // Hide sidebar on small screens when chat is selected
  }}
>
    <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
      <h2>Chats</h2>
    </Paper>
    <Box
      sx={{
        height: "calc(100vh - 120px)", // Adjusting height to account for header
        overflowY: "auto",
        position: "absolute",
        top: "64px", // Space for the header
        width: "100%",
      }}
    >
      <List>
        {users
          .filter((user) => user.id !== currentUserId)
          .map((user) => (
            <ListItem
              key={user.id}
              sx={{
                cursor: "pointer",
                bgcolor: selectedUser === user.id ? "gray.200" : "transparent",
                "&:hover": { bgcolor: "gray.100" },
              }}
              onClick={() => setSelectedUser(user.id)}
            >
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                {user.username.charAt(0)}
              </Avatar>
              <ListItemText primary={user.username} />
            </ListItem>
          ))}
      </List>
    </Box>
  </Box>

  {/* Chat Section */}
  {selectedUser && (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
        position: "relative",
        height: "100vh", // Ensure full page height
      }}
    >
      {/* Chat Header */}
      <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white", position: "sticky", top: 0, zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
          <IconButton color="inherit" onClick={() => setSelectedUser("")} sx={{ display: { md: "none" } }}>
            <ChevronLeftIcon fontSize="large"/>
          </IconButton>
          <span>{users.find((u) => u.id === selectedUser)?.name || "Unknown"}</span>
        </Box>
      </Paper>

      {/* Chat Messages */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          position: "relative",
          top: "0px", // Space for the header
          bottom: "0px", // Space for the input box
          width: "auto",
        }}
      >
        {messages[selectedUser]?.map((msg, index) => {
          const isSentByCurrentUser = msg.senderId === currentUserId;
          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: isSentByCurrentUser ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: "80%",
                  bgcolor: isSentByCurrentUser ? "primary.main" : "grey.200",
                  color: isSentByCurrentUser ? "white" : "black",
                  borderRadius: "16px",
                  boxShadow: 2,
                }}
              >
                {msg.text}
              </Paper>
            </Box>
          );
        })}
      </Box>

      {/* Input and Send Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          position: "sticky",
          bottom: 0,
          bgcolor: "background.default",
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton color="primary" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )}
</Box>
</Box> 


  );
}
