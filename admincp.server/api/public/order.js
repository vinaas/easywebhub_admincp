'use strict';

const _ = require('lodash');
const uuid = require('node-uuid');
const orderEmailTemplate = require('email-template/order');
const orderDetailEmailTemplate = require('email-template/order-detail');

module.exports = app => {
    return {
        'post/': (req, res, next) => {
            if (req.params.customer && req.params.customer.email) {
                // luu db
                let docId = uuid.v4();
                let data = req.params;
                data._id = docId;
                data._type = 'Order';
                app.orderBucket.upsert(docId, data, (err, ret) => {
                    if (err) {
                        res.json({code: -1, message: err.message});
                        return next();
                    }

                    // send email cho admin
                    return app.mailer.send(orderDetailEmailTemplate('mytu358@gmail.com', JSON.stringify(req.params))).then(ret => {
                        // send email cho khach
                        return app.mailer.send(orderEmailTemplate(req.params.customer.email)).then(ret => {
                            res.json({code: 0, message: 'success'});
                            next();
                        }).catch(err => {
                            res.json({code: -1, message: err.message});
                            next();
                        });
                    }).catch(err => {
                        res.json({code: -1, message: err.message});
                        next();
                    });
                });
            } else {
                res.json({code: -1, message: 'order don\'t have email field'});
                return next();
            }
        }
    };
};
