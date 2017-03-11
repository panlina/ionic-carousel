angular.module('carousel', ['ionic'])
	.directive('carousel', function ($ionicGesture) {
		return {
			scope: {
				ngModel: '=',
				carouselIndex: '=?',
				carouselOnDrag: '&',
				carouselOnDragEnd: '&',
				carouselController: '='
			},
			template: function (element) {
				return "<div class=carousel-strip style=transition-property:transform;><div ng-repeat=\"$item in ngModel\">" + element.html() + "</div></div><div class=carousel-progressbar><div ng-repeat=\"_ in ngModel\" ng-class={active:carouselIndex==$index}></div></div>";
			},
			compile: function (element, attr) {
				return function (scope, element) {
					var strip = angular.element(element[0].querySelector(".carousel-strip"));
					var width = element.prop('offsetWidth');
					var x = 0;
					scope.carouselIndex = 0;
					$ionicGesture.on('drag', function ($event) {
						var x1 = x + $event.gesture.deltaX;
						x1 = resist(x1);
						translate(x1);
						scope.carouselOnDrag({ x: x1 });
					}, strip);
					$ionicGesture.on('dragend', function ($event) {
						var index = nearest(x + $event.gesture.deltaX);
						x = width * index;
						scope.carouselIndex = -index;
						scope.$apply();
						translate(x, .4);
						scope.carouselOnDragEnd({ x: x });
					}, strip);
					scope.$watch('ngModel', function (value) {
						if (!value) return;
						strip.css('width', width * value.length + 'px');
						strip.children().css('width', width + 'px');
					});
					scope.carouselController = {
						slide: function (index) {
							x = -width * index;
							scope.carouselIndex = index;
							translate(x, .4);
						}
					};
					function translate(x, duration) {
						strip.css({ 'transition-duration': (duration || 0) + 's' });
						strip.css({ transform: "translate3d(" + x + "px,0,0)" });
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