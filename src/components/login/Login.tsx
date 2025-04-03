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
import {API_BASE_URL} from "@/config/api";
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
  
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log("Response data:", data); // 🔍 Check backend response in console
  
      if (!response.ok) {
        throw new Error(data.message || "Invalid Credential"); // 🛠 Ensure correct message
      }
  
      // ✅ Set token and authentication status
      setToken(data.token);
      setIsAuthenticated(true);
      setUser(data.user);
  
      // Store token and user in cookies for persistence
      Cookies.set("token", data.token, { expires: 7 });
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 });
  
      router.push("/"); // Redirect after login
    } catch (err: any) {
      console.log("Error caught:", err.message); // 🔍 Debug actual error
      setError(err.message); // Display correct error message
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full sm:w-96 space-y-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>

        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-700">Don't have an account? </span>
            <a onClick={() => router.push("/signup")} className="text-blue-500 hover:underline cursor-pointer">Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
