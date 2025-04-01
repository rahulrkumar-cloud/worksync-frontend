"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useRouter } from "next/navigation";
import MenuItem from '@mui/material/MenuItem';
import MailIcon from '@mui/icons-material/Mail';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '@/context/TokenProvider';
import MoreIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function PrimarySearchAppBar() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const { setToken, isAuthenticated, setIsAuthenticated, user, setUser, logout } = useAuth();
    const router = useRouter();
    console.log("isAuthenticatedisAuthenticatedisAuthenticated", user)
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        logout();
        // setToken(null);
        // setIsAuthenticated(false);
        // setUser(null);
        // destroyCookie(null, "token");
        // destroyCookie(null, "user");
        router.push("/login");  // Redirect to login page without reloading
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
            className='mt-12'
        >
            {isAuthenticated && (
                <Box>
                    <MenuItem onClick={handleMenuClose}>Hello, {user?.name}</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                    <MenuItem onClick={handleMenuClose}>My account</MenuItem>
                </Box>
            )}
            <MenuItem onClick={handleMenuClose}>
                {isAuthenticated ? (
                    <div onClick={handleLogout}>Logout</div>
                ) : (
                    <div onClick={() => router.push("/login")}>Signin</div>
                )}
            </MenuItem>
        </Menu>
    );


    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            className="mt-12"
        >
            {isAuthenticated && (
                <Box>
                    <MenuItem>
                        <Typography>Hello, {user?.name}</Typography>
                    </MenuItem>
                    <MenuItem>
                        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                            <Badge badgeContent={4} color="error">
                                <MailIcon />
                            </Badge>
                        </IconButton>
                        <p>Messages</p>
                    </MenuItem>
                    <MenuItem>
                        <IconButton size="large" aria-label="show 17 new notifications" color="inherit">
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <p>Notifications</p>
                    </MenuItem>
                    <MenuItem>
                        <IconButton size="large" aria-label="account of current user" color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <p>Profile</p>
                    </MenuItem>
                    {/* ✅ Logout added inside the authenticated user menu */}
                    <MenuItem onClick={handleLogout}>
                        <IconButton size="large" color="inherit">
                            <LogoutIcon />
                        </IconButton>
                        <Typography>Logout</Typography>
                    </MenuItem>
                </Box>
            )}
        </Menu>
    );


    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ display: { xs: 'block', sm: 'block' }, cursor: 'pointer' }}
                            onClick={() => router.push("/")}
                        >
                            WorkSync
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {isAuthenticated && (
                                <><>
                                    <IconButton size="large" aria-label="show 4 new mails" color="inherit">
                                        <Badge badgeContent={4} color="error">
                                            <MailIcon />
                                        </Badge>
                                    </IconButton>
                                    <IconButton size="large" aria-label="show 17 new notifications" color="inherit">
                                        <Badge badgeContent={17} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>
                                </>
                                    <IconButton
                                        size="large"
                                        edge="end"
                                        aria-label="account of current user"
                                        aria-controls={menuId}
                                        aria-haspopup="true"
                                        onClick={handleProfileMenuOpen}
                                        color="inherit"
                                    >
                                        <AccountCircle />
                                    </IconButton></>)}
                        </Box>
                        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                            {isAuthenticated && (
                                <IconButton
                                    size="large"
                                    aria-label="show more"
                                    aria-controls={mobileMenuId}
                                    aria-haspopup="true"
                                    onClick={handleMobileMenuOpen}
                                    color="inherit"
                                >
                                    <MoreIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
        </Box>
    );
}
