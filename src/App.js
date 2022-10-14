/**
 *
 * Creates general layout
 *
 */
import React, { useEffect } from "react";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";

import FolderView from "./components/folderview.jsx";
import IntroText from "./Intro.jsx";

import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#c0c0c0",
    },
    action: {
      disabled: "#808080"
    }
  },
});

function App() {
  const [startFolder, setStartFolder] = React.useState({
    root: [],
    folders: [],
    total: 0,
    showDrawerFolders: true,
  });

  /**
   * Drawer for settings
   */
  const [showDrawerSettings, setShowDrawerSettings] = React.useState(false);
  const toggleDrawerSettings = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setShowDrawerSettings(open);
  };

  const toggleDrawerFolders = (open) => (event) => {
    setStartFolder({ ...startFolder, showDrawerFolders: open });
  };

  /**
   * User settings
   */

  const [userSettings, setUserSettings] = React.useState({
    sortOrderFiles: true,
    sortOrderFolders: true,
  });

  //  let sortOrderFolders = window.electronAPI.getStoreValue("sort-folders");

  const handleChangeSettingsFiles = (event) => {
    window.electronAPI.setStoreValue("sort-files", event.target.checked);
    setUserSettings({ ...userSettings, sortOrderFiles: event.target.checked });
  };

  const handleChangeSettingsFolders = (event) => {
    window.electronAPI.setStoreValue("sort-folders", event.target.checked);
    setUserSettings({
      ...userSettings,
      sortOrderFolders: event.target.checked,
    });
    if (event.target.checked === true) {
      setStartFolder({
        ...startFolder,
        folders: startFolder.folders.sort(),
      });
    } else if (event.target.checked === false) {
      setStartFolder({
        ...startFolder,
        folders: startFolder.folders.sort().reverse(),
      });
    }
  };

  useEffect(() => {
    window.electronAPI
      .getStoreValue("sort-folders")
      .then((data) =>
        setUserSettings({ ...userSettings, sortOrderFolders: data })
      );
    window.electronAPI
      .getStoreValue("sort-files")
      .then((data) =>
        setUserSettings({ ...userSettings, sortOrderFiles: data })
      );
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          height: "100vh",
        }}
      >
        <AppBar position="fixed">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="Settings"
              onClick={toggleDrawerSettings(true)}
            >
              <SettingsOutlinedIcon />
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="Open Folder"
              onClick={async () => {
                const foldersWithFiles = await window.electronAPI.openFolder();
                setStartFolder({
                  root: foldersWithFiles.root,
                  folders: foldersWithFiles.folders,
                  total: foldersWithFiles.total,
                  showDrawerFolders: false,
                });
              }}
            >
              <FolderOpenIcon />
            </IconButton>
            <IconButton
              disabled={startFolder.total === 0}
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="Jump to folder"
              onClick={toggleDrawerFolders(true)}
            >
              <ExpandMoreOutlinedIcon />
            </IconButton>
            <Typography
              variant="h6"
              color="inherit"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              ZXInfo Explorer
            </Typography>
            <Box
              sx={{ maxHeight: 50 }}
              component="img"
              src="./images/rainbow.png"
            />
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          open={showDrawerSettings}
          onClose={toggleDrawerSettings(false)}
        >
          <Paper variant="outlined" sx={{ my: 0, p: 2, width: 350 }}>
            <Typography component="h1" variant="h6">
              Settings
            </Typography>
            <Divider />
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="sortOrderFolders"
                      checked={userSettings.sortOrderFolders}
                      onChange={handleChangeSettingsFolders}
                    />
                  }
                  label="Sort folders ascending"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="sortOrderFiles"
                      checked={userSettings.sortOrderFiles}
                      onChange={handleChangeSettingsFiles}
                    />
                  }
                  label="Sort filenames ascending"
                />
              </Grid>
              <Grid item xs={12}></Grid>
              <Button
                variant="contained"
                onClick={toggleDrawerSettings(false)}
                sx={{ mt: 3, ml: 1 }}
              >
                OK
              </Button>
            </Grid>
          </Paper>
        </Drawer>
        <Container fixed>
          <Box sx={{ my: 0, height: "100%" }}>
            <Toolbar />
            {startFolder.folders && startFolder.folders.length > 0 ? (
              <React.Fragment>
                <FolderView
                  folders={startFolder.folders}
                  sortOrder={userSettings.sortOrderFiles}
                  showDrawerFolders={startFolder.showDrawerFolders}
                />
              </React.Fragment>
            ) : (
              <IntroText></IntroText>
            )}
            <Toolbar />
          </Box>
        </Container>

          <div className="footer">
          <Container>
            <Box sx={{ display: "flex" }}>
              <Typography>
                {startFolder.total} file(s) found in {startFolder.root}
              </Typography>
            </Box>
            </Container>
          </div>
      </Box>
    </ThemeProvider>
  );
}

export default App;
