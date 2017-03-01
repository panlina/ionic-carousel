angular.module('carousel', ['ionic'])
	.directive('carousel', function ($ionicGesture) {
		return {
			compile: function (element) {
				var width = element.prop('offsetWidth');
				var n = element.children().length;
				var children = element.children()
					.wrap('<div>')
					.parent()
					.css('width', width + 'px');
				var strip = angular.element("<div>")
					.append(children)
					.css('width', width * n + 'px')
					.css({ 'transition-property': 'transform' });
				element.append(strip);
				var x = 0;
				$ionicGesture.on('drag', function ($event) {
					translate(x + $event.gesture.deltaX);
				}, strip);
				$ionicGesture.on('dragend', function ($event) {
					x = width * nearest(x + $event.gesture.deltaX);
					translate(x, .4);
				}, strip);
				function translate(x, duration) {
					strip.css({ 'transition-duration': (duration || 0) + 's' });
					strip.css({ transform: "translateX(" + x + "px)" });
				}
				function nearest(x) {
					x /= width;
					if (x > 0) return 0;
					if (x < -(n - 1)) return -(n - 1);
					var f = Math.floor(x);
					return x < f + .5 ? f : (f + 1);
				}
			}
		};
	})