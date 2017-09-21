'use strict';

const config = require('../config');

module.exports = {
    parse: function (formData, a) {
        let r = /([^\[\]]+)\[(\d+)\]/.exec(a[0]);

        if (r) {
            console.log(r);
            let v = r[1];
            let index = r[2];
            if (!formData[v]) {
                formData[v] = [];
            }

            formData[v][index] = a[1];
            return formData;
        }

        formData[a[0]] = a[1];
        return formData;
    }
};