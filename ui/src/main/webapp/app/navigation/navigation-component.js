angular.module('app').component('navigation', navigation());

function navigation() {
    return {
        templateUrl: 'app/navigation/navigation.html',
        controller: NavigationController,
        controllerAs: 'ctrl'
    };
}

function NavigationController($scope, $mdDialog, $location, graph, operationService, results, query, config) {
    var vm = this;
    vm.loading = false;
    vm.addMultipleSeeds = false;

    vm.addSeedPrompt = function(ev) {
        $mdDialog.show({
            preserveScope: true,
            template: '<seed-builder aria-label="Seed Builder"></seed-builder>',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        })
        .then(function(seeds) {
            for(var i in seeds) {
                graph.addSeed(seeds[i].vertexType, JSON.stringify(seeds[i].vertex));
            }
        });
    }

    vm.openBuildQueryDialog = function(ev) {
        $mdDialog.show({
          template: '<query-builder aria-label="Query Builder" class="fullWidthDialog"></query-builder>',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function(operation) {
            query.addOperation(operation);
            query.execute(JSON.stringify({
                class: "uk.gov.gchq.gaffer.operation.OperationChain",
                operations: [operation, operationService.createLimitOperation(), operationService.createDeduplicateOperation()]
            }), function(data) {
                loading = false;
                results.update(data);
            })
        });
    }

    vm.isGraphInView = function() {
        return $location.path() === '/graph';
    }

    vm.redraw = function() {
        graph.redraw();
    }


    vm.executeAll = function() {
        results.clear();
        var ops = query.getOperations();

        if (ops.length > 0) {
            vm.loading = true;
        }

        for(var i in ops) {
            try {
                query.execute(JSON.stringify({
                    class: "uk.gov.gchq.gaffer.operation.OperationChain",
                    operations: [ops[i], operationService.createLimitOperation(), operationService.createDeduplicateOperation()]
                }), function(data) {
                    results.update(data);
                    vm.loading = false;
                });
            } catch(e) {
                // Try without the limit and deduplicate operations
                query.execute(JSON.stringify({
                    class: "uk.gov.gchq.gaffer.operation.OperationChain",
                    operations: [ops[i]]
                }), function(data) {
                    results.update(data);
                    vm.loading = false;
                });
           }
       }
    }
}