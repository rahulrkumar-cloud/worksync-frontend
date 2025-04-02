"use client";

import { useEffect, useState } from "react";
import { 
  List, ListItem, ListItemText, Typography, 
  CircularProgress, Box, Button 
} from "@mui/material";
import { useRouter } from "next/navigation";
import {API_BASE_URL} from "@/config/api";
import { useAuth } from "@/context/TokenProvider"; // ✅ Token context
import { destroyCookie } from "nookies";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const { token, setToken,isAuthenticated } = useAuth(); // ✅ Get token and setToken
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("isAuthenticated",isAuthenticated)

  useEffect(() => {
    if (!token) return; // ✅ Wait until token is available

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
    setUsers(data);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setLoading(false);
  }
};

    fetchUsers();
  }, [token]); // ✅ Runs only when token changes

  const handleLogout = () => {
    destroyCookie(null, "token");
    setToken(null); // ✅ Remove token from context
  };

  if (!isAuthenticated) return <Typography>Loading authentication...</Typography>;
  if (loading) 
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh" 
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: 2 }}>

      <Typography variant="h6">User List</Typography>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText primary={user.name} secondary={user.email} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

