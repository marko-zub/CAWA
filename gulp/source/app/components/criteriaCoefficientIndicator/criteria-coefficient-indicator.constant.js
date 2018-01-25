(function() {

    'use strict';

    angular
        .module('app.components')
        .constant('DecisionCriteriaCoefficientsConstant', {
            COEFFICIENT_LIST: [{
                name: 'lower',
                value: 0.1
            },{
                name: 'low',
                value: 0.5
            }, {
                name: 'normal',
                value: 1
            }, {
                name: 'high',
                value: 1.5
            }, {
                name: 'important',
                value: 2.5
            }, {
                name: 'significant',
                value: 4
            }, {
                name: 'critical',
                value: 7
            }],
            COEFFICIENT_DEFAULT: {
                name: 'normal',
                value: 1
            }
        });
})();