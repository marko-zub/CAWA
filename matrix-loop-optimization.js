function createMatrixContentOnce(decisions, criteriaGroups, characteristicGroups) {
    // console.log(decisions);
    if (criteriaGroups) vm.criteriaGroups = criteriaGroups;
    if (characteristicGroups) vm.characteristicGroups = characteristicGroups;

    emptyRow = createEmtyObjList(decisions.length);

    // Fill criteria empty decisions
    _.map(vm.criteriaGroups, function(resultEl) {
        _.map(resultEl.criteria, function(criteriaItem) {
            if (criteriaItem.description && !_.isObject(criteriaItem.description)) {
                criteriaItem.description = $sce.trustAsHtml(criteriaItem.description);
            }
            criteriaItem.decisionsRow = createEmtyObjList(decisions.length);
        });
    });

    // Fill characteristics empty decisions
    _.map(vm.characteristicGroups, function(resultEl) {
        _.map(resultEl.characteristics, function(characteristicsItem) {
            if (characteristicsItem.description && !_.isObject(characteristicsItem.description)) {
                characteristicsItem.description = $sce.trustAsHtml(characteristicsItem.description);
            }
            characteristicsItem.decisionsRow = createEmtyObjList(decisions.length);
        });
    });

    for (var itemIndex = decisions.length - 1; itemIndex >= 0; itemIndex--) {
        // console.log(decision.criteria);
        var decisionSend = _.pick(decisions[itemIndex].decision, 'decisionId', 'nameSlug');

        // criteria
        for (var i = decisions[itemIndex].criteria.length - 1; i >= 0; i--) {
            findCriteriaIndexById(vm.criteriaGroups, decisions[itemIndex].criteria[i], decisionSend, itemIndex);
        };

        for (var i = decisions[itemIndex].characteristic.length - 1; i >= 0; i--) {
            findCharacteristicsIndexById(vm.characteristicGroups, decisions[itemIndex].characteristic[i], decisionSend, itemIndex);
        };        

    };
}

function findCriteriaIndexById(array, criteria, decision, decisionIndex) {
    for (var i = array.length - 1; i >= 0; i--) {
        for (var i = array[i].criteria.length - 1; i >= 0; i--) {
            if (array[i].criteria.criterionId === criteria.criterionId) {
                array[i].criteria.decisionsRow[decisionIndex].criteria = criteria;
            }
        };
    };
}

function findCharacteristicsIndexById(array, characteristics, decision, decisionIndex) {
    for (var i = array.length - 1; i >= 0; i--) {
        for (var i = array[i].characteristics.length - 1; i >= 0; i--) {
            if (array[i].characteristics.criterionId === characteristics.criterionId) {
                array[i].characteristics.decisionsRow[decisionIndex].characteristics = characteristics;
            }
        };
    };    
}