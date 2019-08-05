const fs = require('fs');
const AWS = require('aws-sdk');
const pkg =  require('./package');
const path = require('path');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = (file) => {
  const params = {
    Bucket: 'download.elasticsearch.org', 
    Key: 'code/native-git/' + path.basename(file) , 
    Body: fs.createReadStream(file)
  };
  s3.upload(params, function(s3Err, data) {
    if (s3Err) throw s3Err
    console.log(`File uploaded successfully at ${data.Location}`)
  });
};
pkg().then(packageFile => uploadFile(packageFile))
