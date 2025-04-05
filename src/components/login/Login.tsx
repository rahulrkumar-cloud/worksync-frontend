// "use client";

// import React, { useState } from "react";
// import { TextField, Button, Card, Typography, Grid } from "@mui/material";
// import { useRouter } from "next/navigation";
// import {API_BASE_URL} from "@/config/api";
// import { useAuth } from "@/context/TokenProvider";
// import Cookies from "js-cookie";

// const Login = () => {
//   const { setToken, setIsAuthenticated, setUser } = useAuth();
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_BASE_URL}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       // ✅ Set token and authentication status
//       setToken(data.token);
//       setIsAuthenticated(true);
//       setUser(data.user); // ✅ Store user data

//       // Store token and user in cookies for persistence
//       Cookies.set("token", data.token, { expires: 7 });
//       Cookies.set("user", JSON.stringify(data.user), { expires: 7 });

//       router.push("/");
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 2 }}>
//       <Grid>
//         <Card sx={{ padding: 4, boxShadow: 3, borderRadius: 2 }}>
//           <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
//             Login
//           </Typography>

//           {error && <Typography color="error" align="center">{error}</Typography>}

//           <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
//             <TextField
//               type="email"
//               fullWidth
//               label="Email"
//               name="email"
//               variant="outlined"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />

//             <TextField
//               fullWidth
//               label="Password"
//               name="password"
//               type="password"
//               variant="outlined"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />

//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               fullWidth
//               sx={{ textTransform: "none", fontSize: "16px", padding: "10px" }}
//               disabled={loading}
//             >
//               {loading ? "Signing In..." : "Sign In"}
//             </Button>
//           </form>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// };

// export default Login;


"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/context/TokenProvider"; // assuming you have a context provider for authentication
import Cookies from "js-cookie";

const Login: React.FC = () => {
  const { setToken, setIsAuthenticated, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    // Check if input is an email or username
    const isEmail = formData.email.includes("@"); // Check for '@' to determine email
  
    const payload = isEmail
      ? { email: formData.email, password: formData.password } // Login with email
      : { username: formData.email, password: formData.password }; // Login with username
  
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("Response data:", data); // 🔍 Debug response
  
      if (!response.ok) {
        throw new Error(data.message || "Invalid Credentials");
      }
  
      // ✅ Store token and user data
      setToken(data.token);
      setIsAuthenticated(true);
      setUser(data.user);
  
      Cookies.set("token", data.token, { expires: 7 });
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 });
  
      router.push("/"); // Redirect after login
    } catch (err: any) {
      console.log("Error caught:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white px-6 py-10 sm:p-10 rounded-xl shadow-2xl w-full max-w-md space-y-8 mt-6">
        <div className="relative text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text drop-shadow-xl tracking-tight leading-snug sm:leading-tight mb-6 sm:mb-8">
  Welcome Back!<br className="hidden md:block" /> Ready to Dive In?
</h2>

          <svg
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 sm:w-44 md:w-56 h-6 text-pink-500 animate-bounce"
            viewBox="0 0 200 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 20C30 5 70 30 100 10C130 -10 170 30 195 5"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
  
        {error && <div className="text-center text-red-500">{error}</div>}
  
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-3 sm:py-4 rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition duration-300 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
  
          <div className="text-center text-sm pt-2">
            <span className="text-gray-700">Don't have an account? </span>
            <span
              onClick={() => router.push("/signup")}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default Login;
