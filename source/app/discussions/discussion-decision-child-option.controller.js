(function() {

    'use strict';

    angular
        .module('app.discussions')
        .controller('DiscussionDecisionChildOptionController', DiscussionDecisionChildOptionController);

    DiscussionDecisionChildOptionController.$inject = ['decisionDiscussionInfo', 'DiscussionsDataService', '$rootScope', '$stateParams', 'DecisionDataService', '$state'];

    function DiscussionDecisionChildOptionController(decisionDiscussionInfo, DiscussionsDataService, $rootScope, $stateParams, DecisionDataService, $state) {
        var vm = this;

        var params = {
            'id': parseInt($stateParams.id),
            'slug': $stateParams.slug,
            'criteria': $stateParams.criteria,
        };

        vm.params = params;

        vm.discussion = decisionDiscussionInfo || {};

        var critOrCharTitle = '';
        if (vm.discussion.childCharacteristic) {
            pageTitle += ' ' + vm.discussion.childCharacteristic.name;
            critOrCharTitle = vm.discussion.childCharacteristic.name;
        } else if (vm.discussion.childCriterion) {
            pageTitle += ' ' + vm.discussion.childCriterion.name;
            critOrCharTitle = vm.discussion.childCriterion.name;
        }



        vm.goToDiscussion = goToDiscussion;

        init();

        function init() {
            console.log('Discussion Child Option Controller');

            console.log(vm.discussion);
            setPageTitle();

            // getCriteriaGroupsById(vm.discussion.decision.id);
            // getCharacteristicsGroupsById(vm.discussion.decision.id);

            // TODO: avoid $stateParams
            if (vm.discussion.childCriterion) searchCommentableVotesWeight($stateParams.discussionId, $stateParams.critOrCharId);

            // TODO: optimize, in resolver some bugs with state
            // // Add slug for child decision
            if (vm.discussion.childCriterion) {
                $state.go('decisions.single.matrix.child.option', {
                    critOrCharId: $stateParams.critOrCharId,
                    critOrCharSlug: vm.discussion.childCriterion.nameSlug
                }, {
                    notify: false,
                    reload: false
                });
            } else if (vm.discussion.childCharacteristic) {
                $state.go('decisions.single.matrix.child.option', {
                    critOrCharId: $stateParams.critOrCharId,
                    critOrCharSlug: vm.discussion.childCharacteristic.nameSlug
                }, {
                    notify: false,
                    reload: false,
                    location: false
                });
            }

            // console.log(vm.discussion.decision);
            $rootScope.breadcrumbs = [{
                title: 'Decisions',
                link: 'decisions'
            }, {
                title: vm.discussion.decision.name,
                link: 'decisions.single'
            }, {
                title: 'Comparison Matrix',
                link: 'decisions.single.matrix'
            }, {
                title: vm.discussion.childDecision.name,
                link: 'decisions.single.matrix.child'
            }, {
                title: critOrCharTitle,
                link: null
            }];
        }

        function searchCommentableVotesWeight(discussionId, critOrCharId) {
            if (!discussionId || !critOrCharId) return;
            DiscussionsDataService.searchCommentableVotesWeight(discussionId, critOrCharId)
                .then(function(resp) {
                    // console.log(resp);
                    vm.discussion.votes = resp;
                }).catch(function(err) {
                    console.log(err);
                });
        }

        function setPageTitle() {
            var pageTitle = vm.discussion.childDecision && vm.discussion.childDecision.name;
            vm.title = pageTitle;
            $rootScope.pageTitle = 'Discussion ' + pageTitle + ' | DecisionWanted';
        }

        function goToDiscussion(discussionId, critOrCharId) {
            params.discussionId = discussionId;
            params.critOrCharId = critOrCharId;
            $state.go('decisions.single.matrix.child.option', params);
        }

    }
})();