angular.module('carousel', ['ionic'])
	.directive('carousel', function ($ionicGesture) {
		return {
			scope: {
				ngModel: '=',
				onDrag: '&'
			},
			compile: function (element, attr) {
				var width = element.prop('offsetWidth');
				var strip = element.children()
					.wrap('<div ng-repeat="$item in ' + attr.ngModel + '" style=width:' + width + 'px;>')
					.parent()
					.wrap("<div>")
					.parent()
					.css({ 'transition-property': 'transform' });
				return function (scope, element) {
					var x = 0;
					$ionicGesture.on('drag', function ($event) {
						translate(x + $event.gesture.deltaX);
						scope.onDrag({ x: x + $event.gesture.deltaX });
					}, strip);
					$ionicGesture.on('dragend', function ($event) {
						x = width * nearest(x + $event.gesture.deltaX);
						translate(x, .4);
					}, strip);
					scope.$watch('ngModel', function (value) {
						if (!value) return;
						element.children().css('width', width * value.length + 'px');
					});
					function translate(x, duration) {
						strip.css({ 'transition-duration': (duration || 0) + 's' });
						strip.css({ transform: "translateX(" + x + "px)" });
					}
					function nearest(x) {
						var n = scope.ngModel.length;
						x /= width;
						if (x > 0) return 0;
						if (x < -(n - 1)) return -(n - 1);
						var f = Math.floor(x);
						return x < f + .5 ? f : (f + 1);
					}
				};
			}
		};
	})