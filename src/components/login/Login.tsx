"use client"
import React, { useState } from "react";
import { TextField, Button, Card, Typography, Grid } from "@mui/material";
import API_BASE_URL from "@/config/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login successful:", data);
      alert("Login successful!");
    } catch (err: any) {
      setError(err.message);
      console.error("Error logging in:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid 
      container 
      justifyContent="center" 
      alignItems="center" 
      sx={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 2 }}
    >
      <Grid >
        <Card sx={{ padding: 4, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            Login
          </Typography>

          {error && <Typography color="error" align="center">{error}</Typography>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
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

          <Typography align="center" color="textSecondary" mt={2}>
            Don't have an account? <a href="/signup" style={{ color: "#1976d2" }}>Sign up</a>
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;
