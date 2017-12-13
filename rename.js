const path = require('path');
const fs = require('fs');
const rootPath = __filename;
const dir = path.dirname(rootPath) + '/app/view';

renameFiles(dir);

function changeName(filepath) {
  fs.stat(filepath, function(err, stats) {
    if (err) {
      console.log(err);
      return;
    }

    if(stats.isFile()) {
      const newPath = filepath.replace(/jade$/g, 'pug');

      fs.rename(filepath, newPath, (err) => {
        if (err) {
          console.log(err);
        }
      });
    } else {
      renameFiles(filepath);
    }
  });
}

function renameFiles(dir) {
  fs.readdir(dir, function(err, files) {
    files.forEach(file => {
      changeName(`${dir}/${file}`);
    });
  });
}
