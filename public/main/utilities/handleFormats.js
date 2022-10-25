const log = require("electron-log");
const crypto = require("crypto");

const snafmt = require("./sna_format");
const z80fmt = require("./z80_format");
const tapfmt = require("./tap_format");

const screenZX = require("./handleSCR");

function getZXFormat(fileName, subFileName, data) {
  const mylog = log.scope(`getZXFormat (${fileName})`);
  mylog.debug(`${fileName}, ${subFileName}, size = ${data.length}`);

  // Calculate sha512 value
  let sum = crypto.createHash("sha512");
  sum.update(data);

  let ZXFileInfo = {
    filename: fileName,
    subfilename: subFileName,
    version: null,
    type: null,
    sha512: sum.digest("hex"),
    scr: null,
    error: null,
  };

  let extension;
  if (subFileName && subFileName.length > 0) {
    mylog.debug(`File inside archive`);
    extension = subFileName;
  } else {
    mylog.debug(`Single file`);
    extension = fileName;
  }

  let obj;
  if (extension.toLowerCase().endsWith(".sna")) {
    mylog.debug(`handling SNA`);
    obj = snafmt.readSNA(data);
    ZXFileInfo.version = obj.type;
    ZXFileInfo.type = "snafmt";
  } else if (extension.toLowerCase().endsWith(".z80")) {
    mylog.debug(`handling Z80`);
    obj = z80fmt.readZ80(data);
    ZXFileInfo.version = obj.type;
    ZXFileInfo.type = "z80fmt";
  } else if (extension.toLowerCase().endsWith(".tap")) {
    mylog.debug(`handling TAP`);
    obj = tapfmt.readTAP(data);
    ZXFileInfo.version = obj.type;
    ZXFileInfo.type = "tapfmt";
  } else if (extension.toLowerCase().endsWith(".zip")) {
    mylog.debug(`handling ZIP`);
    obj = { version: null, type: null, scrdata: null, error: null };
    ZXFileInfo.type = "zip";
  } else {
    obj = { version: null, type: null, error: "Unhandled file format" };
    ZXFileInfo.type = null;
    mylog.warn(`Can't identify file format for: ${extension}`);
    ZXFileInfo.scr = "./images/no_image.png";
  }

  if (obj.version) {
    ZXFileInfo.version = obj.version;
  }
  if (obj.hwmodel) {
    ZXFileInfo.hwmodel = obj.hwmodel;
  }

  if (obj.error) {
    ZXFileInfo.error = obj.error;
    ZXFileInfo.scr = "./images/no_image.png";
    return ZXFileInfo;
  }

  if (obj.scrdata) {
    screenZX.createSCR(obj.scrdata, obj.border).then((res) => {
      if (res.buffer) {
        ZXFileInfo.scr =
          "data:image/gif;base64," + res.buffer.toString("base64");
      } else {
        ZXFileInfo.scr = res;
      }
    });
  } else {
    ZXFileInfo.scr = "./images/no_image.png";
  }

  return ZXFileInfo;
}

exports.getZXFormat = getZXFormat;
