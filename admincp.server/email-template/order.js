'use strict';

const Assert = require('assert-plus');

module.exports = (to, data) => {
    Assert.string(to, 'to');
    return {
        from:    'MTfashion@lici.vn',
        to:      to,
        subject: 'MTfashion order',
        html:    `Đơn hàng của bạn ở website MTfashion đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn ngay`
    };
};
