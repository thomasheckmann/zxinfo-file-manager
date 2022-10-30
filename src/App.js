/**
 *
 * Creates general layout
 *
 */
import React, { useEffect } from "react";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { styled } from "@mui/material/styles";

import {
  Alert,
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
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import MuiToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import FolderView from "./components/folderview.jsx";
import IntroText from "./Intro.jsx";

import "./App.css";
import { Stack } from "@mui/system";

const ToggleButton = styled(MuiToggleButton)({
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "white",
    backgroundColor: "#008000",
  },
  "&.Mui-disabled": {
    color: "#a0a0a0",
    backgroundColor: "#004000",
  },
});
const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#c0c0c0",
    },
    action: {
      disabled: "#808080",
    },
  },
});

const defaultFileFilters = ["sna", "z80", "slt", "dsk", "trd", "mdr", "tap", "tzx", "zip"];

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

window.electronAPI.onNotifyAboutFolder((_event, value) => {
  console.log(JSON.stringify(value));
});

function App() {
  const [startFolder, setStartFolder] = React.useState({
    root: [],
    folders: [],
    total: 0,
    showDrawerFolders: true,
    showDrawerSettings: false,
    fileFilters: defaultFileFilters,
  });

  const [notifyOpen, setNotifyOpen] = React.useState({ status: false, filename: null });
  const handleNotifyClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotifyOpen({ ...notifyOpen, status: false });
  };
  window.electronAPI.onNotifyAboutFile((_event, value) => {
    // setNotifyOpen({ status: false, filename: null });
    setNotifyOpen({ status: true, filename: value });
  });

  /**
   * xs, sm, md, lg, xl
   * @returns
   */
  const greaterThanLG = useMediaQuery(theme.breakpoints.up("xl"));
  const lgTOxl = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  const mdTOlg = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const smTOmd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const lessThanSM = useMediaQuery(theme.breakpoints.down("sm"));
  function getBreakPointName() {
    if (greaterThanLG) {
      return "XL";
    } else if (lgTOxl) {
      return "LG";
    } else if (mdTOlg) {
      return "MD";
    } else if (smTOmd) {
      return "SM";
    } else if (lessThanSM) {
      return "XS";
    }
  }

  /**
   * Drawer for settings
   */
  const toggleDrawerSettings = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }

    setStartFolder({
      ...startFolder,
      showDrawerSettings: open,
      showDrawerFolders: false,
    });
    // setShowDrawerSettings(open);
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

  const handleFormatFilter = (event, newFormats) => {
    setStartFolder({
      ...startFolder,
      fileFilters: newFormats,
      // showDrawerFolders: false,
    });
  };

  useEffect(() => {
    window.electronAPI
      .getStoreValue("sort-folders")
      .then((data) => setUserSettings({ ...userSettings, sortOrderFolders: data }));
    window.electronAPI
      .getStoreValue("sort-files")
      .then((data) => setUserSettings({ ...userSettings, sortOrderFiles: data }));
  }, []);

  const handleOpenFolderFromChild = async (childData) => {
    const foldersWithFiles = await window.electronAPI.openFolder();
    setStartFolder({
      root: foldersWithFiles.root,
      folders: foldersWithFiles.folders[0],
      total: foldersWithFiles.total,
      showDrawerFolders: false,
      showDrawerSettings: false,
      fileFilters: defaultFileFilters,
    });
    window.scrollTo({
      top: 0,
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box position="fixed" top={0} height="60px" width="100%">
        -header-
      </Box>

      <Snackbar open={notifyOpen.status} onClose={handleNotifyClose} autoHideDuration={1000}>
        <Alert onClose={handleNotifyClose} severity="success" sx={{ width: "100%" }}>
          Added file: {notifyOpen.filename}
        </Alert>
      </Snackbar>
      <Box marginTop="50px">
        <AppBar position="fixed">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="Settings"
              onClick={toggleDrawerSettings(true)}
            >
              <Tooltip title="Settings">
                <SettingsOutlinedIcon />
              </Tooltip>
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
                  showDrawerSettings: false,
                  fileFilters: defaultFileFilters,
                });
                window.scrollTo({
                  top: 0,
                });
              }}
            >
              <Tooltip title="Open Folder">
                <FolderOpenIcon />
              </Tooltip>
            </IconButton>
            <IconButton
              disabled={startFolder.folders.length < 2}
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="Jump to folder"
              onClick={toggleDrawerFolders(true)}
            >
              <Tooltip title="Jump to folder">
                <ExpandMoreOutlinedIcon />
              </Tooltip>
            </IconButton>

            <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
              ZXInfo File Browser
              {!process.env.NODE_ENV || process.env.NODE_ENV === "development" ? " - " + getBreakPointName() : ""}
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={startFolder.fileFilters}
              onChange={handleFormatFilter}
              aria-label="Formats"
              disabled={startFolder.total === 0}
              sx={{ background: "#ffffff", mr: 10 }}
            >
              {defaultFileFilters.map((ext) => (
                <ToggleButton value={ext} key={ext}>
                  {ext}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Box sx={{ maxHeight: 50 }} component="img" src="./images/rainbow2.jpg" />
          </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={startFolder.showDrawerSettings} onClose={toggleDrawerSettings(false)}>
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
              <Button variant="contained" onClick={toggleDrawerSettings(false)} sx={{ mt: 3, ml: 1 }}>
                OK
              </Button>
            </Grid>
          </Paper>
        </Drawer>
        <Container maxWidth="xl">
          {startFolder.folders && startFolder.folders.length > 0 ? (
            <FolderView
              folders={startFolder.folders}
              sortOrder={userSettings.sortOrderFiles}
              showDrawerFolders={startFolder.showDrawerFolders}
              fileFilters={startFolder.fileFilters}
            />
          ) : (
            <IntroText parentCallback={handleOpenFolderFromChild}></IntroText>
          )}
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
