'use strict';

const db = require('app').bucket;
const N1qlQuery = require('couchbase').N1qlQuery;

class Account {

}
// INSERT
// myBucket.insert('document_name', {some:'value'}, function(err, res) {
//     if (err) {
//         console.log('operation failed', err);
//         return;
//     }
//
//     console.log('success!', res);
// });

// GET
// myBucket.get(‘document_name’, function(err, res) {
//     if (err) {
//         console.log(‘operation failed’, err);
//         /*
//          operation failed { [Error: The key already exists in the server.] code: 12 }
//          */
//         return;
//     }
//     console.log(‘success!’, res);
// });

// DELETE myBucket.remove('document_name', function(err, res) {
// UPDATE myBucket.replace('document_name', {some: 'value'}, function(err, res) {
// UPSERT myBucket.upsert('document_name', {some: 'value'}, function(err, res) {

// MULTI GET myBucket.getMulti(['document_name_1', 'document_name_2'], function(err, res) {

// var query = ViewQuery.from('beer', 'by_name').skip(6).limit(3);
// myBucket.query(query, function(err, results) {
//     for(i in results)
//         console.log(results[i]);
// });

module.exports = Account;
