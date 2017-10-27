(function() {

    'use strict';

    angular
        .module('app.components')
        .controller('OwnerUsersController', OwnerUsersController)
        .component('ownerUsers', {
            bindings: {
                list: '<',
                becomeTitle: '<',
            },
            templateUrl: 'app/components/ownerUsers/owner-users.html',
            controller: 'OwnerUsersController',
            controllerAs: 'vm'
        });


    OwnerUsersController.$inject = ['Utils'];

    function OwnerUsersController(Utils) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            vm.list = prepareList(vm.list);
        }

        function prepareList (list) {
        	return _.map(list, function (user) {
        		user.avName = (user.firstName && user.lastName) && (user.firstName[0] && user.lastName[0]) ? user.firstName[0] + user.lastName[0] : user.userName[0];
                user.reputation = Utils.numberToUi(user.reputation, 2);
        		return user;
        	});
        }
    }

})();