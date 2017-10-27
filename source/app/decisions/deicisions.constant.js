(function() {

    'use strict';

    angular
        .module('app.components')
        .constant('DecisionsConstant', {
            NAVIGATON_STATES: [{
                key: 'newest',
                value: 'createDate',
                label: 'Newest'
            }, {
                key: 'active',
                value: 'updateDate',
                label: 'Active'
            }, {
                key: 'views',
                value: 'totalViews',
                label: 'Views'
            }],
            SHORT_TEXT_LENGTH: 350,
            SORT_DECISION_PROPERTY_OPTIONS: [{
                id: 'name',
                name: 'NAME'
            }, {
                id: 'createDate',
                name: 'CREATE DATE'
            }, {
                id: 'updateDate',
                name: 'UPDATE DATE'
            }, {
                id: 'totalViews',
                name: 'TOTAL VIEWS'
            }, {
                id: 'totalFlags',
                name: 'TOTAL FLAGS'
            }, {
                id: 'likeSum',
                name: 'LIKE SUM'
            }],
            RADIO_GROUP_OPTIONS: [{
                value: null,
                label: 'All'
            }, {
                value: true,
                label: 'Yes'
            }, {
                value: false,
                label: 'No'
            }]
        });
})();