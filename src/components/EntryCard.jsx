/**
 *
 * entry = {
 *      filename:
 *      subfilename: <only used if entry is within ZIP file>
 *      version: "SNA"
 *      type: "snafmt"
 *      sha512: <used to perform lookup in ZXInfo API
 *      src: <base64hex image>
 *      error: <error text>
 * }
 *
 *
 */

import React, { useContext, useEffect, useState } from "react";

import { Alert, Avatar, Card, CardActions, CardContent, CardHeader, CardMedia, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { red } from "@mui/material/colors";
import axios from "axios";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { render } from "@testing-library/react";
import ZXInfoSettings from "../common/ZXInfoSettings";

function formatType(t) {
  switch (t) {
    case "snafmt":
      return "SNA";
    case "z80fmt":
      return "Z80";
    case "tapfmt":
      return "TAP";
    case "tzxfmt":
      return "TZX";
    case "dskfmt":
      return "DSK";
    case "sclfmt":
      return "SCL";
    case "trdfmt":
      return "TRD";
    case "mdrfmt":
      return "MDR";
    case "zip":
      return "ZIP";
    default:
      return t;
  }
}

const openLink = (id) => {
  window.electronAPI.openZXINFODetail(id).then((res) => {});
};

const openFolderFile = (name) => {
  window.electronAPI.locateFileAndFolder(name).then((res) => {});
};

function EntryCard(props) {
  const [appSettings, setAppSettings] = useContext(ZXInfoSettings);
  const [entry, setEntry] = useState();
  const [restCalled, setRestCalled] = useState(false);

  const toggleFavorite = async (event) => {
    if (!appSettings.favorites) {
      var favMap = new Map();
      favMap.set(entry.sha512, entry);
      var obj = Object.fromEntries(favMap);
      var jsonString = JSON.stringify(obj);
      window.electronAPI.setFavorites("favorites", jsonString);
    } else {
      if (appSettings.favorites.get(entry.sha512)) {
        appSettings.favorites.delete(entry.sha512);
      } else {
        appSettings.favorites.set(entry.sha512, entry);
      }
      var obj = Object.fromEntries(appSettings.favorites);
      var jsonString = JSON.stringify(obj);
      window.electronAPI.setFavorites("favorites", jsonString);
    }
  };

  useEffect(() => {
    if (!restCalled) {
      setRestCalled(true);
      const dataURL = `https://api.zxinfo.dk/v3/filecheck/${props.entry.sha512}`;
      axios
        .get(dataURL)
        .then((response) => {
          let item = props.entry;
          item.zxdbID = response.data.entry_id;
          item.zxdbTitle = response.data.title;
          setEntry(item);
        })
        .catch((error) => {
          setEntry(props.entry);
        })
        .finally(() => {});
    }
  }, [entry]);

  return (
    entry && (
      <Card raised elevation={5}>
        <CardHeader
          sx={{
            backgroundColor: entry.type === "zip" ? "#606060" : "#808080",
            display: "flex",
            overflow: "hidden",
            "& .MuiCardHeader-content": {
              overflow: "hidden",
            },
          }}
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
              <Typography variant="overline" display="block" gutterBottom>
                {formatType(entry.type)}
              </Typography>
            </Avatar>
          }
          action={
            <Tooltip title="Locate file">
              <IconButton aria-label="Locate file" onClick={(name) => openFolderFile(entry.filepath)}>
                <InsertLinkOutlinedIcon />
              </IconButton>
            </Tooltip>
          }
          title={
            <Tooltip title={entry.filename}>
              <Typography variant="subtitle" noWrap gutterBottom>
                {entry.filename}
              </Typography>
            </Tooltip>
          }
          titleTypographyProps={{ noWrap: true }}
          subheaderTypographyProps={{ noWrap: true }}
          subheader={entry.subfilename}
        />
        {entry.error ? <Alert severity="warning">{entry.error}</Alert> : ""}
        <CardMedia component="img" image={entry.scr} alt={entry.filename} />
        <CardContent>
          <Typography gutterBottom variant="subtitle1" component="div" noWrap>
            {entry.zxdbTitle ? entry.zxdbTitle : entry.filename}
          </Typography>
          <Typography gutterBottom variant="subtitle2" component="div" noWrap>
            {entry.text}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {entry.version && <Chip label={entry.version} />}
            {entry.hwmodel && <Chip label={entry.hwmodel} />}
            {entry.zxdbID && <Chip label={entry.zxdbID} variant="outlined" onClick={(id) => openLink(entry.zxdbID)} />}
          </Stack>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton aria-label="add to favorites" onClick={() => toggleFavorite(this)}>
            <FavoriteBorderOutlinedIcon />
          </IconButton>
        </CardActions>
      </Card>
    )
  );
}

export default EntryCard;
