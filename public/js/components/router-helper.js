angular.module('spaModule')
    .factory('routerHelper', [function () {
        return {
            url: function (urlTemplate, args) {
                return urlTemplate.replace(/:([^\/]+)/g, function (m, capturedGroup) {
                    return args[capturedGroup];
                });
            }
        };
    }]);