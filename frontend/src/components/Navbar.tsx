import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon, Home, Search, Add, Person, Favorite, List } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleCreateProperty = () => {
    handleMenuClose();
    navigate('/create-property');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfile}>
        <Person sx={{ mr: 1 }} />
        Mi Perfil
      </MenuItem>
      <MenuItem onClick={handleCreateProperty}>
        <Add sx={{ mr: 1 }} />
        Crear Propiedad
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        Cerrar Sesión
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleHome}>
        <Home sx={{ mr: 1 }} />
        Inicio
      </MenuItem>
      <MenuItem onClick={handleSearch}>
        <Search sx={{ mr: 1 }} />
        Buscar
      </MenuItem>
      {isAuthenticated && (
        <MenuItem onClick={() => navigate('/favorites')}>
          <Favorite sx={{ mr: 1 }} />
          Favoritos
        </MenuItem>
      )}
      {isAuthenticated && (
        <>
          <MenuItem onClick={() => navigate('/my-properties')}>
            <List sx={{ mr: 1 }} />
            Mis Propiedades
          </MenuItem>
          <MenuItem onClick={handleProfile}>
            <Person sx={{ mr: 1 }} />
            Mi Perfil
          </MenuItem>
          <MenuItem onClick={handleCreateProperty}>
            <Add sx={{ mr: 1 }} />
            Crear Propiedad
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Cerrar Sesión
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
      <Toolbar>
        {isMobile && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'primary.main'
          }}
          onClick={handleHome}
        >
          ZonMatch
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={handleHome}
            >
              Inicio
            </Button>
            <Button
              color="inherit"
              startIcon={<Search />}
              onClick={handleSearch}
            >
              Buscar
            </Button>
            {isAuthenticated && (
              <Button
                color="inherit"
                startIcon={<Favorite />}
                onClick={() => navigate('/favorites')}
              >
                Favoritos
              </Button>
            )}
            {isAuthenticated && (
              <Button
                color="inherit"
                startIcon={<List />}
                onClick={() => navigate('/my-properties')}
              >
                Mis Propiedades
              </Button>
            )}
            {isAuthenticated && (
              <Button
                color="primary"
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateProperty}
              >
                Crear Propiedad
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated ? (
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Registrarse
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
      {renderMenu}
      {renderMobileMenu}
    </AppBar>
  );
};

export default Navbar;
