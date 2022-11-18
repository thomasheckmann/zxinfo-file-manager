import React, { useContext, useEffect, useState } from "react";
import { Box, Divider, Paper, Typography } from "@mui/material";
import InfiniteEntriesList from "../components/InfiniteEntriesList";
import ZXInfoSettings from "../common/ZXInfoSettings";
import FavoriteTwoToneIcon from '@mui/icons-material/FavoriteTwoTone';

const NO_OF_ITEMS = 9; // number of files to fetch/display - should adapt to breakpoint?

function FavoritesList(props) {
  const [appSettings] = useContext(ZXInfoSettings);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    var favorites = appSettings.favorites;

    var items = [];
    for (let [key, value] of favorites) {
        items.push(...value);
    }
    let uniqueFileNames = [...new Set(items)];

    // remove duplicates
    setFiles(uniqueFileNames);
  }, [appSettings.favorites]);

  return (
    <Paper elevation={5} sx={{ height: "vh", my: 4 }}>
      <Box sx={{ display: "flex", p: 2 }}>
        <FavoriteTwoToneIcon />
        <Typography variant="button">My favorites</Typography>
      </Box>
      <Divider variant="middle" />
      <InfiniteEntriesList files={files} maxsize={NO_OF_ITEMS}></InfiniteEntriesList>
    </Paper>
  );
}

export default FavoritesList;
