"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/TokenProvider";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreIcon from "@mui/icons-material/MoreVert";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AppBar
      position="sticky"
      className="bg-white/10 backdrop-blur-lg shadow-lg border border-gray-200/30 z-50 top-0 left-0 right-0"
    >
      <Toolbar className="flex justify-between px-6">
        {/* Logo */}
        <Box
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <WorkOutlineIcon fontSize="large" />
          <Typography
            variant="h5"
            className="font-bold text-transparent bg-white bg-clip-text uppercase tracking-wide"
          >
            WorkSync
          </Typography>
        </Box>
  
        {/* Icons Section */}
        <Box className="hidden md:flex gap-5 items-center">
          {isAuthenticated && (
            <>
              <IconButton className="hover:scale-105 transition-transform">
                <Badge badgeContent={4} color="error">
                  <MailIcon className="text-gray-600 hover:text-indigo-500" />
                </Badge>
              </IconButton>
              <IconButton className="hover:scale-105 transition-transform">
                <Badge badgeContent={17} color="error">
                  <NotificationsIcon className="text-gray-600 hover:text-indigo-500" />
                </Badge>
              </IconButton>
              <IconButton
                className="hover:scale-105 transition-transform"
                onClick={handleProfileMenuOpen}
              >
                <AccountCircle className="text-gray-600 hover:text-indigo-500" />
              </IconButton>
            </>
          )}
        </Box>
  
        {/* Mobile Menu */}
        <Box className="md:hidden">
          {isAuthenticated && (
            <IconButton onClick={handleMobileMenuOpen}>
              <MoreIcon className="text-gray-600 hover:text-indigo-500" />
            </IconButton>
          )}
        </Box>
      </Toolbar>
  
      {/* Dropdown Menus */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        className="mt-4"
      >
        <MenuItem>Hello, {user?.name}</MenuItem>
        <MenuItem>Profile</MenuItem>
        <MenuItem>My Account</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
  
      <Menu
        anchorEl={mobileMoreAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        className="mt-2"
      >
        <MenuItem>Hello, {user?.name}</MenuItem>
        <MenuItem className="gap-2">
          <IconButton>
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          Messages
        </MenuItem>
        <MenuItem className="gap-2">
          <IconButton>
            <Badge badgeContent={17} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          Notifications
        </MenuItem>
        <MenuItem onClick={handleProfileMenuOpen} className="gap-2">
          <IconButton>
            <AccountCircle />
          </IconButton>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} className="gap-2">
          <IconButton>
            <LogoutIcon />
          </IconButton>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
  
}
