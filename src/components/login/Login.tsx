"use client";

import React, { useState } from "react";
import { TextField, Button, Card, Typography, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/config/api";
import { useAuth } from "@/context/TokenProvider";
import Cookies from "js-cookie";

const Login = () => {
  const { setToken, setIsAuthenticated, setUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Set token and authentication status
      setToken(data.token);
      setIsAuthenticated(true);
      setUser(data.user); // ✅ Store user data

      // Store token and user in cookies for persistence
      Cookies.set("token", data.token, { expires: 7 });
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 });

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 2 }}>
      <Grid>
        <Card sx={{ padding: 4, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Login
          </Typography>

          {error && <Typography color="error" align="center">{error}</Typography>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
              type="email"
              fullWidth
              label="Email"
              name="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ textTransform: "none", fontSize: "16px", padding: "10px" }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;
