/**
 *
 * https://worldofspectrum.org/faq/reference/formats.htm#Tape
 *
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 *
 *    data,
 *    srcdata,
 *    type,
 *    error,
 * }
 */
const log = require("electron-log");
//log.transports.console.level = 'debug';

const util = require("./tape_util");

function readTAP(data) {
  const mylog = log.scope("readTAP");
  mylog.debug(`input: ${data.length}`);
  mylog.info(`processing TAP file...`);

  var snapshot = { type: null, error: null, scrdata: null };
  snapshot.type = "TAP";

  let tap = [];

  for (let index = 0; index < data.length; ) {
    const blockLength = data[index] + data[index + 1] * 256;
    index += 2; // skip two length bytes
    const dataBlock = data.subarray(index, index + blockLength);
    if (dataBlock[0] === 0) {
      mylog.debug(`found header block at index: ${index}`);
      const block = util.createHeader(dataBlock);
      if (block.error) {
        snapshot.error = block.error;
      }
      tap.push(block);
    } else if (dataBlock[0] === 255) {
      const block = util.createData(dataBlock);
      if (block.error) {
        snapshot.error = block.error;
      }
      mylog.debug(`found data block at index: ${index}, length=${block.data.length}`);
      tap.push(block);
    } else {
      mylog.warn(`found unknown block at index: ${index} - ${dataBlock[0]}`);
    }
    index += blockLength; // skip data block
  }

  // iterate tap[] - find first code block starting at 16384 OR with lengh og 6912
  snapshot.text = tap[0].type + ": " + tap[0].name;
  for (let index = 0; index < tap.length; index++) {
    const element = tap[index];
    mylog.debug(`${index}: ${element.type}, ${element.flag}`);
    if (element.type === "Code") {
      if (element.startAddress === 16384) {
        mylog.debug(`Found code starting at 16384...(screen area)`);
        snapshot.scrdata = tap[index + 1].data;
        snapshot.border = 7;
        break;
      } else if (element.len === 6912) {
        mylog.debug(`Found code with length 6912...(screen length)`);
        snapshot.scrdata = tap[index + 1].data;
        snapshot.border = 7;
        break;
      } else if (element.len > 6912) {
        mylog.debug(`Found code with length(${element.len}) > 6912 - try using it as screen...`);
        snapshot.scrdata = tap[index + 1].data;
        snapshot.border = 7;
        break;
      }
    } else if (!element.type && element.flag === "data") {
      // headerless data with length 6912 or bigger than 32768
      mylog.debug(`data block: ${element.data.length}`);
      if (element.data.length > 32767 || element.data.length === 6912) {
        mylog.debug(`Headerless data with length(${element.data.length}) > 32767 - try using it as screen...`);
        snapshot.scrdata = element.data;
        snapshot.border = 7;
      }
    }

    snapshot.data = tap;
  }

  return snapshot;
}

// const testdata = readTAP("./testdata/ElStompo.tap");

exports.readTAP = readTAP;
