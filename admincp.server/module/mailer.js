'use strict';

const Assert = require('assert-plus');
const SparkPost = require('sparkpost');
const BlueBird = require('bluebird');

function SendMailHtmlSparkPost(me, from, recipients, subject, html) {
    Assert.object(me, 'me');
    
    return new BlueBird((resolve, reject) => {
        me.sparkPost.transmissions.send({
            transmissionBody: {
                content:    {
                    from:    from,
                    subject: subject,
                    html:    html
                },
                recipients: recipients
            }
        }, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

class mailer {
    constructor(type, opts) {
        Assert.string(type, 'type');
        Assert.object(opts, 'opts');
        this.serviceType = type;
        switch (type) {
            case 'sparkpost':
                Assert.string(opts.apiKey, 'opts.apiKey');
                this.sparkPost = new SparkPost(opts.apiKey);
                break;
            default:
                console.error(`mailer type ${type} not supported`);
                process.exit(1);
        }
    }

    send(opts) {
        Assert.object(opts, 'opts');
        Assert.string(opts.from, 'opts.from');
        Assert.string(opts.subject, 'opts.subject');
        Assert.string(opts.html, 'opts.html');
        let recipients = [];
        switch (this.serviceType) {
            case 'sparkpost':
                // handle 'to' array
                if (typeof(opts.to) === 'string') {
                    recipients.push({address: opts.to});
                } else if (Array.isArray(opts.to)) {
                    opts.to.forEach(emailAddress => {
                        if (typeof(emailAddress) === 'string')
                            recipients.push({address: emailAddress});
                    })
                }
                return SendMailHtmlSparkPost(this, opts.from, recipients, opts.subject, opts.html);
                break;
            default:
                console.error(`mailer type ${type} not supported`);
                process.exit(1);
        }
    }
}

module.exports = mailer;
