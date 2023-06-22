const log = require("electron-log");
const screenZX = require("./handleSCR");

// Mapping to ASCII
const cmap_zx81 = [
  " ",
  "{1}",
  "{2}",
  "{3}",
  "{4}",
  "{5}",
  "{6}",
  "{7}",
  "{8}",
  "{9}",
  "{10}",
  '"',
  "£",
  "$",
  ":",
  "?",
  "(",
  ")",
  ">",
  "<",
  "=",
  "+",
  "-",
  "*",
  "/",
  ";",
  ",",
  ".",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "RND",
  "INKEY$",
  "PI",
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  "#",
  "|1|",
  "|2|",
  "|3|",
  "|4|",
  "|5|",
  "|6|",
  "|7|",
  "|8|",
  "|9|",
  "|10|",
  '"',
  "£",
  "$",
  ":",
  "?",
  "(",
  ")",
  ">",
  "<",
  "=",
  "+",
  "-",
  "*",
  "/",
  ";",
  ",",
  ".",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  '"',
  "AT ",
  "TAB ",
  null,
  "CODE ",
  "VAL ",
  "LEN ",
  "SIN ",
  "COS ",
  "TAN ",
  "ASN ",
  "ACS ",
  "ATN ",
  "LN ",
  "EXP ",
  "INT ",
  "SQR ",
  "SGN ",
  "ABS ",
  "PEEK ",
  "USR ",
  "STR$ ",
  "CHR$ ",
  "NOT ",
  "**",
  " OR ",
  " AND ",
  "<=",
  ">=",
  "<>",
  " THEN ",
  " TO ",
  " STEP ",
  " LPRINT ",
  " LLIST ",
  " STOP ",
  " SLOW ",
  " FAST ",
  " NEW ",
  " SCROLL ",
  " CONT ",
  " DIM ",
  " REM ",
  " FOR ",
  " GOTO ",
  " GOSUB ",
  " INPUT ",
  " LOAD ",
  " LIST ",
  " LET ",
  " PAUSE ",
  " NEXT ",
  " POKE ",
  " PRINT ",
  " PLOT ",
  " RUN ",
  " SAVE ",
  " RAND ",
  " IF ",
  " CLS ",
  " UNPLOT ",
  " CLEAR ",
  " RETURN ",
  " COPY ",
];

const cmap_lambda = [
  " ",
  "{1}",
  "{2}",
  "{3}",
  "{4}",
  "{5}",
  "{6}",
  "{7}",
  "{8}", // CAR
  "{9}", // TRIANGLE 1
  "{10}", // TRIANGLE 2
  '"',
  "£", // ALIEN
  "$",
  ":", // BUTTERFLY
  "?", // GHOST
  "(",
  ")",
  ">",
  "<",
  "=",
  "+",
  "-",
  "*",
  "/",
  ";",
  ",",
  ".",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " THEN", // RND
  " TO ", // INKEY$
  "STEP ", // PI
  "RND",
  "INKEY$",
  "PI",
  "INK",
  "PAPER",
  "BORDER",
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  "#",
  "|1|",
  "|2|",
  "|3|",
  "|4|",
  "|5|",
  "|6|",
  "|7|",
  "|8|",
  "|9|",
  "|10|",
  '"',
  "£",
  "$",
  ":",
  "?",
  "(",
  ")",
  ">",
  "<",
  "=",
  "+",
  "-",
  "*",
  "/",
  ";",
  ",",
  ".",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "CODE ", // ""
  "VAL ", // AT
  "LEN ", // TAB
  "SIN",
  "COS ", // CODE
  "TAN ", // VAL
  "ASN ", // LEN
  "ACS ", // SIN
  "ATN ", // COS
  "LOG ", // TAN
  "EXP ", // ASN
  "INT ",  // ACS
  "SQR ",  // ATN
  "SGN ", // LN
  "ABS ",  // EXP
  "PEEK ",  // INT
  "USR ",  // SQR
  "STR$ ",  // SGN
  "CHR$ ",//ABS
  "NOT ", // PEEK
  "AT ",// USR
  "TAB ",// STR$
  "**",// CHR$
  " OR ",// NOT
  " AND ", // **
  "<=", // OR
  ">=",// AND
  "<>",// <=
  " TEMPO ",// >=
  " MUSIC ",// <>
  " SOUND ",// THEN
  " BEEP ",// TO
  " NOBEEP ",// STEP
  " LPRINT ",
  " LLIST ",
  " STOP ",
  " SLOW ",
  " FAST ",
  " NEW ",
  " SCROLL ",
  " CONT ",
  " DIM ",
  " REM ",
  " FOR ",
  " GOTO ",
  " GOSUB ",
  " INPUT ",
  " LOAD ",
  " LIST ",
  " LET ",
  " PAUSE ",
  " NEXT ",
  " POKE ",
  " PRINT ",
  " PLOT ",
  " RUN ",
  " SAVE ",
  " RAND ",
  " IF ",
  " CLS ",
  " UNPLOT ",
  " CLEAR ",
  " RETURN ",
  " COPY ",
];

// maps ASCII to ZX81
const ascii_zx81 = new Map([
  [" ", 0x00],
  ['"', 0x0b],
  ["£", 0x0c],
  ["$", 0x0d],
  [":", 0x0e],
  ["?", 0x0f],
  ["(", 0x10],
  [")", 0x11],
  [">", 0x12],
  ["<", 0x13],
  ["=", 0x14],
  ["+", 0x15],
  ["-", 0x16],
  ["*", 0x17],
  ["/", 0x18],
  [";", 0x19],
  [",", 0x1a],
  [".", 0x1b],
  ["0", 0x1c],
  ["1", 0x1d],
  ["2", 0x1e],
  ["3", 0x1f],
  ["4", 0x20],
  ["5", 0x21],
  ["6", 0x22],
  ["7", 0x23],
  ["8", 0x24],
  ["9", 0x25],
  ["A", 0x26],
  ["B", 0x27],
  ["C", 0x28],
  ["D", 0x29],
  ["E", 0x2a],
  ["F", 0x2b],
  ["G", 0x2c],
  ["H", 0x2d],
  ["I", 0x2e],
  ["J", 0x2f],
  ["K", 0x30],
  ["L", 0x31],
  ["M", 0x32],
  ["N", 0x33],
  ["O", 0x34],
  ["P", 0x35],
  ["Q", 0x36],
  ["R", 0x37],
  ["S", 0x38],
  ["T", 0x39],
  ["U", 0x3a],
  ["V", 0x3b],
  ["W", 0x3c],
  ["X", 0x3d],
  ["Y", 0x3e],
  ["Z", 0x3f],
]);

function printZX81(image, x, y, text, showFullList, inREMline, versn) {
  const mylog = log.scope("printZX81");

  // convert to "printable", bit 7 = 1, inverse -
  var zx81string = "";
  for (var i = 0; i < text.length; i++) {
    const charVal = text.charCodeAt(i);

    if (charVal < 64) {
      // The character set has 64 unique glyphs present at code points 0–63
      zx81string += text[i];
    } else if (127 < charVal && charVal < 192) {
      // inverse video; corresponding to code points 128–191
      zx81string += String.fromCharCode(charVal - 64);
    } else {
      // lookup 'keyword'
      var mapped = cmap_zx81[charVal];
      if (versn === 255) {
        mapped = cmap_lambda[charVal];
      }
      if (mapped) {
        if ((i === 5 || inREMline) && mapped[0] === " ") {
          mapped = mapped.slice(1);
        } else if (inREMline && charVal === 192) {
          mapped = '""';
        } else if (inREMline && (charVal === 216 || charVal === 221)) {
          // add trailing space to ** and <>
          mapped += " ";
        }
        // map from ASCII to ZX81
        for (var ii = 0; ii < mapped.length; ii++) {
          zx81string += String.fromCharCode(ascii_zx81.get(mapped[ii]));
        }
      } else {
        zx81string += String.fromCharCode(15); // ?  question mark
      }
    }
  }
  return screenZX.printAtZX81(image, x, y, zx81string, showFullList ? 999999 : 22, versn);
}

exports.printZX81 = printZX81;
