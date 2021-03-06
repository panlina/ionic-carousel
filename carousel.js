﻿angular.module('carousel', ['ionic'])
	.directive('carousel', function ($ionicGesture, $compile) {
		return {
			scope: {
				ngModel: '=',
				carouselIndex: '=?',
				carouselOnDrag: '&',
				carouselOnDragEnd: '&',
				carouselController: '='
			},
			template: function (element) {
				return "<div class=carousel-strip style=transition-property:transform;></div><div class=carousel-progressbar><div ng-repeat=\"_ in ngModel\" ng-class={active:carouselIndex==$index}></div></div>";
			},
			transclude: true,
			compile: function (element, attr) {
				return function (scope, element, attr, ctrl, transclude) {
					var strip = angular.element(element[0].querySelector(".carousel-strip"));
					var width = element.prop('offsetWidth');
					scope.$watch('ngModel', function (value) {
						strip.empty();
						for (var i in value) {
							var s = scope.$parent.$new();
							s.$item = value[i];
							s.$index = i;
							var child = strip.children().eq(i);
							transclude(s, function (clone, scope) {
								strip.append(
									angular.element("<div>").append(
										$compile(clone)(scope)
									)
								);
							});
						}
					});
					var x = 0;
					scope.carouselIndex = 0;
					$ionicGesture.on('drag', function ($event) {
						var x1 = x + $event.gesture.deltaX;
						x1 = resist(x1);
						translate(x1);
						scope.carouselOnDrag({ x: x1 });
					}, strip);
					$ionicGesture.on('dragend', function ($event) {
						var index = nearest(x, $event.gesture);
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
						},
						next: function () {
							this.slide(
								Math.min(
									scope.carouselIndex + 1,
									scope.ngModel.length - 1
								)
							);
						},
						previous: function () {
							this.slide(
								Math.max(
									scope.carouselIndex - 1,
									0
								)
							);
						},
						remove: function (index) {
							scope.ngModel.splice(index, 1);
							if (scope.carouselIndex >= scope.ngModel.length)
								scope.carouselIndex = scope.ngModel.length - 1;
							scope.$$removeIndex = index;
						}
					};
					scope.$watch(function () {
						if (scope.$$removeIndex == undefined) return;
						angular.element(element[0].querySelector(".carousel-strip")).children().eq(scope.$$removeIndex).remove();
						if (scope.$$x < -width * scope.carouselIndex)
							translate(-width * scope.carouselIndex, 0);
						scope.$$removeIndex = undefined;
					});
					function translate(x, duration) {
						strip.css({ 'transition-duration': (duration || 0) + 's' });
						strip.css({ transform: "translate3d(" + x + "px,0,0)" });
						scope.$$x = x;
					}
					function nearest(x, gesture) {
						var x = x + gesture.deltaX;
						var n = scope.ngModel.length;
						x /= width;
						if (x > 0) return 0;
						if (x < -(n - 1)) return -(n - 1);
						var f = Math.floor(x);
						if (gesture.velocityX >= .2) {
							if (gesture.direction == 'left') return f;
							if (gesture.direction == 'right') return f + 1;
						}
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