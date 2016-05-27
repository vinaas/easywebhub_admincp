'use strict';

const app = require('app');
const N1qlQuery = require('couchbase').N1qlQuery;

const userBucketName = app.conf.get('couchbase.userBucket');

class User {
    static CreatePrimaryIndexes(callback) {
        var indexCreator = function (bucketName) {
            var indexOnUsers = N1qlQuery.fromString("CREATE PRIMARY INDEX ON `" + bucketName + "`");
            console.log(indexOnUsers);
            return indexOnUsers;
        };

        app.bucket.query(indexCreator(userBucketName), (err, result) => {
            if (err) {
                console.log('err', result);
                callback((userBucketName + err), null);
                return;
            }
            console.log(result);
            // app.bucket.query(indexCreator(pictureBucketName), (err, result) => {
            //     if (err) {
            //         callback((pictureBucketName + err), null);
            //         return;
            //     }
            //     console.log(result);
            //     app.bucket.query(indexCreator(publishBucketName), (err, result) => {
            //         if (err) {
            //             callback((publishBucketName + err), null);
            //             return;
            //         }
            //         console.log(result);
            //         callback(null, 'Primary Indexes Created!');
            //     });
            // });
        });
    };
}

User.CreatePrimaryIndexes();

module.exports = User;
