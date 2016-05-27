'use strict';

const Assert = require('assert-plus');

module.exports = (to, data) => {
    Assert.string(to, 'to');
    Assert.object(data, 'data');
    return {
        from:    'order@lici.vn',
        to:      to,
        subject: 'Your order detail',
        html:    `<h3>Received order json data:</h3><br>${data.order}`
    };
};
