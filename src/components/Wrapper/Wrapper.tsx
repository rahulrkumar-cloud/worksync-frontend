"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/TokenProvider";
import { CircularProgress, Box } from "@mui/material"; // ✅ Import MUI loader
import PrimarySearchAppBar from "@/components/WorkSyncNavbar/PrimarySearchAppBar";

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

    // If the user is not logged in and not on Login or Signup page, redirect to login
    if (!token && pathname !== "/login" && pathname !== "/signup") {
      console.log("🚫 No token found! Redirecting to login...");
      router.replace("/login");
    } 
    // If the user is logged in and on login/signup page, redirect to homepage
    else if (token && (pathname === "/login" || pathname === "/signup")) {
      console.log("✅ User is logged in! Redirecting to home...");
      router.replace("/");
    }
  }, [token, router, pathname]);

  // 🛑 Show loading spinner while checking token
  if (isChecking || (!token && (pathname !== "/login" && pathname !== "/signup")) || (token && (pathname === "/login" || pathname === "/signup"))) {
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

  return <div className="wrapper">{children}</div>;
};

export default Wrapper;
