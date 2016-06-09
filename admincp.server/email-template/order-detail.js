'use strict';

const Assert = require('assert-plus');

module.exports = (to, data) => {
    Assert.string(to, 'to');
    return {
        from:    'mtfashion-order@lici.vn',
        to:      to,
        subject: 'Đơn hàng của khách',
        html:    `${data}`
    };
};
