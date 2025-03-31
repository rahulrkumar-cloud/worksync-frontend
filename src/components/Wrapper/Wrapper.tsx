"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/TokenProvider";
import { CircularProgress, Box } from "@mui/material"; // ✅ Import MUI loader
import PrimarySearchAppBar from "@/components/WorkSyncNavbar/PrimarySearchAppBar"
interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get current route
  const { token } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (token === undefined) {
      console.log("🔄 Token is still loading...");
      return;
    }

    setIsChecking(false);

    if (!token && pathname !== "/login") {
      console.log("🚫 No token found! Redirecting to login...");
      router.replace("/login");
    } else if (token && pathname === "/login") {
      console.log("✅ User is logged in! Redirecting to home...");
      router.replace("/");
    }
  }, [token, router, pathname]);

  // 🛑 Show loading spinner while checking token
  if (isChecking || (!token && pathname !== "/login") || (token && pathname === "/login")) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" /> {/* ✅ MUI Loading Spinner */}
      </Box>
    );
  }

  return <div className="wrapper">
    {children}</div>;
};

export default Wrapper;
