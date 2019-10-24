const fs = require('fs');
const AWS = require('aws-sdk');
const pkg =  require('./package');
const os = require('os');
const { exists } = require('./download');
const { paths, pkgName } = require('./util');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
  
const uploadFile = (file, platform) => {
  const packageName = pkgName(platform);
  const params = {
    Bucket: 'download.elasticsearch.org', 
    Key: 'code/native-git/' + packageName , 
    Body: fs.createReadStream(file)
  };
  s3.upload(params, function(s3Err, data) {
    if (s3Err) throw s3Err
    console.log(`File uploaded successfully at ${data.Location}`)
  });
};
 
const platform = os.platform();

exists(platform).then(async exists => {
  if(!exists) {
    const { nativeDir, packagePath } = paths(platform)
    const file = await pkg(nativeDir, packagePath);
    return uploadFile(file, platform);
  } else {
    console.log('binary exists, uploading skipped.')
  }
}).catch(() => process.exit(1))

