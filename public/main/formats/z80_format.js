/**
 *
 * https://worldofspectrum.org/faq/reference/z80format.htm
 *
 * C_FORCE.Z80 - v1, compressed
 * CABAL.Z80 - v2, not compressed
 *
 */

const log = require("electron-log");
//log.transports.console.level = 'debug';

function readCompressed(data, length) {
  var zxram = [];

  var pos = 0;
  while (pos < length) {
    var d = data[pos];
    if (data[pos] === 0xed && data[pos + 1] === 0xed) {
      const c = data[pos + 3];
      const rep = data[pos + 2];
      for (let index = 0; index < rep; index++) {
        zxram.push(c);
      }
      pos += 4;
    } else {
      zxram.push(d);
      pos++;
    }
  }

  return zxram;
}

function readV1(data, compressed) {
  const mylog = log.scope("Z80 - readV1");
  mylog.debug(`readV1 compressed? (${compressed})`);

  const mem = data.subarray(30);
  var zxram = [];

  if (compressed) {
    mylog.debug(`reading compressed v1`);
    return readCompressed(mem, 49152);
  } else {
    mylog.warn(`version NOT supported yet!`);
    return null;
  }

  return zxram;
}

function readV2(data, compressed) {
  const mylog = log.scope("Z80 - readV2");

  const headerLength = data[30];

  /**
   *   find first memory block
    Byte    Length  Description
        ---------------------------
        0       2       Length of compressed data (without this 3-byte header)
                        If length=0xffff, data is 16384 bytes long and not compressed
        2       1       Page number of block
        3       [0]     Data
   * 
   */

  var zxram = [];

  var index = 32 + headerLength;
  var memBlock = data.subarray(index);
  const allDataLength = memBlock.length;

  while (index < allDataLength) {
    var memBlockLen = memBlock[0] + memBlock[1] * 256;
    var memBlockPage = memBlock[2];

    if (memBlockPage === 8 && memBlockLen !== 0xffff) {
      mylog.debug(`reading compressed page with screen....`);

      return readCompressed(memBlock.subarray(3), memBlockLen);
    }

    memBlock = memBlock.subarray(memBlockLen + 3);
    index += memBlockLen + 3;
  }

  return zxram;
}

function readZ80(data) {
  const mylog = log.scope("readZ80");
  mylog.debug(`input: ${data.length}`);

  var snapshot = { error: [], scrdata: null, data: [] };
  var version = 1;
  var compressed = false;

  var fileSize = data.length;
  var regs = {};
  regs.filesize = fileSize;

  regs.AF = data[0] + data[1] * 256;
  regs.BC = data[2] + data[3] * 256;
  regs.HL = data[4] + data[5] * 256;
  regs.PC = data[6] + data[7] * 256;

  regs.SP = data[8] + data[9] * 256;
  regs.I = data[10];
  regs.R = data[11];

  if (data[12] === 255) {
    data[12] = 1;
  }
  snapshot.border = (data[12] >> 1) & 0b00000111;
  regs.SAMROM = data[12] & 0b00010000;
  if (data[12] & 0b00010000) {
    mylog.warn(`SAM ROM?`);
  }
  regs.compressed = data[12] & 0b00100000;
  if (data[12] & 0b00100000) {
    compressed = true;
    mylog.debug(`image is compressed`);
  }
  regs.DE = data[13] + data[14] * 256;
  regs.BCalt = data[15] + data[16] * 256;
  regs.DEalt = data[17] + data[18] * 256;
  regs.HLalt = data[19] + data[20] * 256;
  regs.AFalt = data[21] + data[22] * 256;
  regs.IY = data[23] + data[24] * 256;
  regs.IX = data[25] + data[26] * 256;
  regs.INT = data[27]; // (data[28] < 1) & data[27];

  regs.INTmode = data[29] & 0b00000011;
  regs.flag = data[29];

  if (regs.PC === 0) {
    mylog.debug(`PC=0, version 2 or 3`);
    regs.PC = data[32] + data[33] * 256;
    const v = data[30];
    if (v === 23) {
      version = 2;
      mylog.debug(`- - extra header length: 23, version 2`);
      mylog.debug(`processing Z80 v2 file...`);
    } else if (v === 54 || v === 55) {
      version = 3;
      mylog.debug(`- - extra header length: 54 or 55, version 3`);
      mylog.debug(`processing Z80 v3 file...`);
    }
  } else {
    mylog.debug(`processing Z80 v1 file...`);
  }

  snapshot.type = "Z80 v" + version;
  mylog.debug(`snapshot type: ${snapshot.type}`);

  const hwMode = data[34];
  if (version === 1) {
    const zxram = readV1(data, compressed);
    if(zxram) {
      //snapshot.data = zxram;
      snapshot.scrdata = new Uint8Array(zxram).subarray(0, 6912);
    } else {
      snapshot.error.push({type: "warning", message: "Cant read snapshot, maybe compressed?"});
    }
  } else if (version === 2) {
    const zxram = readV2(data, compressed);
    // snapshot.data = zxram;
    snapshot.scrdata = new Uint8Array(zxram).subarray(0, 6912);
    switch (hwMode) {
      case 0:
        snapshot.hwModel = `48k`;
        break;
      case 1:
        snapshot.hwModel = `48k+ if.1`;
        break;
      case 2:
        snapshot.hwModel = `SamRam`;
        break;
      case 3:
        snapshot.hwModel = `128k`;
        break;
      case 4:
        snapshot.hwModel = `128k + if.1`;
        break;
      default:
        snapshot.hwModel = null;
        mylog.error(`unknown hw model: ${hwMode}`);
        snapshot.error.push({type: "warning", message: `unknown hw model: ${hwMode}`})
        break;
    }
  } else if (version === 3) {
    const zxram = readV2(data, compressed);
    // snapshot.data = zxram;
    snapshot.scrdata = new Uint8Array(zxram).subarray(0, 6912);
    switch (hwMode) {
      case 0:
        snapshot.hwModel = `48k`;
        break;
      case 1:
        snapshot.hwModel = `48k+ if.1`;
        break;
      case 2:
        snapshot.hwModel = `SamRam`;
        break;
      case 3:
        snapshot.hwModel = `48k + M.G.T.`;
        break;
      case 4:
        snapshot.hwModel = `128k`;
        break;
      case 5:
        snapshot.hwModel = `128k + If.1`;
        break;
      case 6:
        snapshot.hwModel = `128k + M.G.T.`;
        break;
      default:
        snapshot.hwModel = null;
        mylog.error(`unknown hw model: ${hwMode}`);
        break;
    }
  }
  mylog.debug(`model: ${snapshot.hwModel}`);

  snapshot.data = regs;

  return snapshot;
}

exports.readZ80 = readZ80;
