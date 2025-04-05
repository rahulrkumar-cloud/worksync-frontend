"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/TokenProvider";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

interface Message {
  text: string;
  senderId: string;
  currenttime: string;
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
  const currentUserId = String(user?.id || "")

  // Inside your Chat component:
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [selectedUser, messages[selectedUser]?.length]);

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io("https://worksync-socket.onrender.com", {
      transports: ["websocket"],
    });

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
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const res = await fetch(`${API_BASE_URL}/messages/${selectedUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }

        const rawData: {
          id: number;
          sender_id: number;
          receiver_id: number;
          message: string;
          created_at: string;
        }[] = await res.json();

        const transformed: Message[] = rawData.map((msg) => ({
          text: msg.message,
          senderId: String(msg.sender_id),
          currenttime: new Date(msg.created_at).toISOString().slice(11, 19),
        }));

        setMessages((prev) => ({
          ...prev,
          [selectedUser]: transformed,
        }));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedUser, token]);

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

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !socket) return;

    const currentTime = new Date().toLocaleTimeString();

    const msgData: Message = {
      text: message,
      senderId: currentUserId,
      currenttime: currentTime,
    };

    socket.emit("privateMessage", {
      ...msgData,
      receiverId: selectedUser,
    });

    try {
      const res = await fetch(
        `${API_BASE_URL}/messages/send/${selectedUser}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      setMessages((prev) => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), msgData],
      }));

      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box className="p-0 rounded-lg mt-0 h-screen fixed top-13 left-0 right-0">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: "100vh",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: { md: "25%", xs: "100%" },
            bgcolor: "background.default",
            borderRight: 1,
            borderColor: "divider",
            position: "relative",
            display: { xs: selectedUser ? "none" : "block", md: "block" },
            minHeight: "100vh",
          }}
        >
          <Paper sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
            <h2>Chats</h2>
          </Paper>
          <Box
            sx={{
              height: "calc(100vh - 120px)",
              overflowY: "auto",
              position: "absolute",
              top: "64px",
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
                      bgcolor:
                        selectedUser === user.id ? "gray.200" : "transparent",
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
              height: "100vh",
            }}
          >
            {/* Chat Header */}
            <Paper
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "white",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => setSelectedUser("")}
                  sx={{ display: { md: "none" } }}
                >
                  <ChevronLeftIcon fontSize="large" />
                </IconButton>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.success",
                      mr: 2,
                      position: "absolute",
                      left: 0,
                      top: "70%",
                      transform: "translateY(-50%)",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {users.find((u) => u.id === selectedUser)?.name.charAt(0)}
                  </Avatar>
                  <span style={{ marginLeft: "50px", marginTop: "10%" }}>
                    {users.find((u) => u.id === selectedUser)?.name || "Unknown"}
                  </span>
                </Box>
              </Box>
            </Paper>

            {/* Messages */}
            <Box
              ref={messagesContainerRef}
              sx={{
                flex: 1,
                p: 2,
                overflowY: "auto",
                position: "relative",
                top: "0px",
                bottom: "0px",
                width: "auto",
                maxHeight: "calc(100vh - 200px)",
              }}
              className="mb-8"
            >
              {messages[selectedUser]?.map((msg, index) => {
                const isSentByCurrentUser = msg.senderId === currentUserId;
                return (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: isSentByCurrentUser
                        ? "flex-end"
                        : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: "80%",
                        bgcolor: isSentByCurrentUser
                          ? "primary.main"
                          : "grey.200",
                        color: isSentByCurrentUser ? "white" : "black",
                        borderRadius: "16px",
                        boxShadow: 2,
                        wordBreak: "break-word",
                      }}
                    >
                      <div>{msg.text}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "gray",
                          marginTop: "4px",
                        }}
                      >
                        {msg.currenttime}
                      </div>
                    </Paper>
                  </Box>
                );
              })}
            </Box>

            {/* Input Field */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
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
                multiline
                minRows={1}
                maxRows={5}
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                  flexGrow: 1,
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    padding: '8.5px 14px',
                  },
                }}
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
