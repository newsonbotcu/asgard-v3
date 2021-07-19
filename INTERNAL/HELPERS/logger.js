function dateTimePad(value, digits) {
  let number = value
  while (number.toString().length < digits) {
    number = "0" + number
  }
  return number;
}

function format(tDate) {
  return (tDate.getFullYear() + "-" +
    dateTimePad((tDate.getMonth() + 1), 2) + "-" +
    dateTimePad(tDate.getDate(), 2) + " " +
    dateTimePad(tDate.getHours(), 2) + ":" +
    dateTimePad(tDate.getMinutes(), 2) + ":" +
    dateTimePad(tDate.getSeconds(), 2) + "." +
    dateTimePad(tDate.getMilliseconds(), 3))
}

module.exports = class Logger {
  static log(content, type = "log") {
    const date = `[${format(new Date(Date.now()))}]:`;
    switch (type) {
      case "log": {
        return console.log(`${date} [LOG] ${content} `);
      }
      case "warn": {
        return console.log(`${date} [WARN] ${content} `);
      }
      case "error": {
        return console.log(`${date} [ERROR] ${content} `);
      }
      case "debug": {
        return console.log(`${date} [DEBUG] ${content} `);
      }
      case "cmd": {
        return console.log(`${date} [CMD] ${content}`);
      }
      case "ready": {
        return console.log(`${date} [READY] ${content}`);
      }
      case "complete": {
        return console.log(`${date} [DONE] ${content}`);
      }
      case "docs": {
        return console.log(`${date} [DOCS] ${content}`);
      }
      case "mngdb": {
        return console.log(`${date} [MONGO] ${content}`);
      }
      case "load": {
        return console.log(`${date} [LOAD] ${content}`);
      }
      case "unload": {
        return console.log(`${date} [UNLOAD] ${content}`);
      }
      case "varn": {
        return console.log(`${date} [WARNING] ${content}`);
      }
      case "caution": {
        return console.log(`${date} [CAUTION] ${content}`);
      }
      case "category": {
        return console.log(`${date} [DIRECTORY] ${content}`);
      }
      default: throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
    }
  }
};
