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
                name: 'Name'
            }, {
                id: 'createDate',
                name: 'Create Date'
            }, {
                id: 'updateDate',
                name: 'Update Date'
            }, {
                id: 'totalViews',
                name: 'Total Views'
            }, {
                id: 'totalFlags',
                name: 'Total Flags'
            }, {
                id: 'likeSum',
                name: 'Like Sum'
            }]
        });
})();