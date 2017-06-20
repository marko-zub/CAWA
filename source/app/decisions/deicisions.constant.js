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
                key: 'votes',
                value: 'totalVotes',
                label: 'Votes'
            }, {
                key: 'views',
                value: 'totalViews',
                label: 'Views'
            }]
        });
})();
