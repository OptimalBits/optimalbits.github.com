const gulp = require("gulp");

//
// S3 Publish
//
const cloudfront = require("gulp-cloudfront-invalidate-aws-publish");
const awspublish = require("gulp-awspublish");

gulp.task("deploy", function () {
  const awsSettings = {
    region: "eu-central-1",
    params: {
      Bucket: "optimalbits.com",
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
    distribution: "E1IFLBFNA2LQPN",
  };

  return publish(awsSettings, ".s3-cache-prod");
});


function publish(awsSettings, cacheFileName) {
  var publisher = awspublish.create(awsSettings, {
    cacheFileName: cacheFileName,
  });

  var headers = {};

  return (
    gulp
      .src("./public/**")
      // gzip, Set Content-Encoding headers and add .gz extension
      //.pipe(awspublish.gzip({ ext: '.gz' }))

      // publisher will add Content-Length, Content-Type and headers specified above
      // If not specified it will set x-amz-acl to public-read by default
      .pipe(publisher.publish(headers))

      // Invalidate index.html
      .pipe(cloudfront(awsSettings))

      //
      // Sync so that old files are deleted.
      //
      .pipe(publisher.sync())

      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache())

      // print upload updates to console
      .pipe(awspublish.reporter())
  );
}

