var path = require('path'), fs=require('fs');

exports.fromDir = function(startPath,filter,callback) {
  if (!fs.existsSync(startPath)){
      console.log("no dir ",startPath);
      return;
  }

  var files=fs.readdirSync(startPath);
  for(var i=0;i<files.length;i++){
      var filename=path.join(startPath,files[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()){
          exports.fromDir(filename,filter,callback); //recurse
      }
      else if (filter.test(filename)) callback(filename);
  }
};
