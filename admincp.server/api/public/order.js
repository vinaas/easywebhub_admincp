'use strict';

const _ = require('lodash');
const uuid = require('node-uuid');
const orderEmailTemplate = require('email-template/order');

module.exports = app => {
    return {
        'post/': (req, res, next) => {
            if (req.params.customer && req.params.customer.email) {
                let emailInfo = orderEmailTemplate(req.params.customer.email, {
                    order: JSON.stringify(req.params.order, null, 4)
                });

                // TODO find good id for order
                let docId = uuid.v4();
                let data = req.params;
                data._id = docId;
                data._type = 'Order';
                app.orderBucket.upsert(docId, data, (err, ret) => {
                    if (err) {
                        res.json({code: -1, message: err.message});
                        return next();
                    }
                });

                // send email
                app.mailer.send(emailInfo).then(ret => {
                    res.json({code: 0, message: 'success'});
                }).catch(err => {
                    res.json({code: -1, message: err.message});
                });
            } else {
                res.json({code: -1, message: 'order don\'t have email field'});
            }

            next();
        }
    };
};
