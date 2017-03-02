angular.module('carousel', ['ionic'])
	.directive('carousel', function ($ionicGesture) {
		return {
			scope: {
				ngModel: '=',
				onDrag: '&',
				onDragEnd: '&'
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
						var x1 = x + $event.gesture.deltaX;
						x1 = resist(x1);
						translate(x1);
						scope.onDrag({ x: x1 });
					}, strip);
					$ionicGesture.on('dragend', function ($event) {
						x = width * nearest(x + $event.gesture.deltaX);
						translate(x, .4);
						scope.onDragEnd({ x: x });
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
					function resist(x) {
						var n = scope.ngModel.length;
						if (x > 0)
							x = atan(x);
						else if (x < -width * (n - 1))
							x = -width * (n - 1) - atan(-width * (n - 1) - x);
						return x;
					}
					function atan(x) {
						var a = 120 / (Math.PI / 2);
						return a * Math.atan(x / a);
					}
				};
			}
		};
	})