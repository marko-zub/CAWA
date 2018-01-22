// (function() {

//     'use strict';

//     angular
//         .module('app.tags')
//         .config(configuration);

//     configuration.$inject = ['$stateProvider'];

//     function configuration($stateProvider) {
//         $stateProvider
//             .state('tags', {
//                 url: '/tags',
//                 views: {
//                     '@': {
//                         templateUrl: 'app/pages/tags/tags.html',
//                         controller: 'TagsController',
//                         controllerAs: 'vm'
//                     }
//                 },
//                 data: {
//                     breadcrumbs: [{
//                         title: 'Tags',
//                         link: null
//                     }]
//                 },
//             });
//     }

// })();