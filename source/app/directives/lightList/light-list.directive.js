(function() {

    'use strict';

    angular
        .module('app.directives')
        .directive('dwLightList', dwLightList);

    dwLightList.$inject = [];

    function dwLightList() {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, el, attrs) {

            var initalized = false;
            scope.$watch(attrs.collection, function(newValue, oldValue) {
                if (newValue && !initalized) {
                    var item = newValue;
                    var listHtml = '';
                    _.each(item.options, function(option) {
                        var checked = '';
                        if (_.includes(item.selectedValue, option.value)) {
                            checked = ' checked';
                        }                        
                        listHtml += [
                            '<div class="filter-item-checkbox" id="' + option.id + '">',
                            '    <input class="js-checkbox" type="checkbox" id="modal-' + item.id + '-option-' + option.id + '" name="modal-' + item.id + '-option-' + option.id + '" ' + checked + '>',
                            '    <label for="modal-' + item.id + '-option-' + option.id + '">' + option.value + '</label>',
                            '</div>'
                        ].join('\n');
                    });
                    el[0].innerHTML = listHtml;
                    initalized = true;
                } else if (!angular.equals(newValue, oldValue)) {
                    var showIds = _.map(newValue.options, 'id');
                    if (showIds.length) {
                        // TODO: hide other ids
                        $(el).find('.filter-item-checkbox').addClass('hide');
                        _.each(showIds, function(id) {
                            $(el).find('#' + id).removeClass('hide');
                        });
                    } else {
                        $(el).find('.filter-item-checkbox').addClass('hide');
                    }
                }
            });
        }
    }

})();