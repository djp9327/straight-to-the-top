describe("Viewport", function() {

	var viewport,
	    element,
	    win,
	    doc;

	beforeEach(function() {
		doc = {};
		win = {
			document: doc,
			innerWidth: 100,
			innerHeight: 100,
			pageXOffset: 0,
			pageYOffset: 0,
			matchMedia: function() {}
		};
		element = {
			offsetTop: 0,
			offsetLeft: 0,
			offsetWidth: 100,
			offsetHeight: 100
		};
		viewport = new Viewport(win);
	});

	describe("contains", function() {

		describe("returns false", function() {

			describe("when the top of the element is below the viewport", function() {

				beforeEach(function() {
					element.offsetTop = 100;
				});

				it("and the left side is in", function() {
					element.offsetWidth = 200;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and the right side is in", function() {
					element.offsetLeft = -10;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and both the left and right sides are in", function() {
					element.offsetLeft = 10;
					element.offsetWidth = 50;
					expect(viewport.contains(element)).toBe(false);
				});

			});

			describe("when the bottom of the element is above the viewport", function() {

				beforeEach(function() {
					element.offsetTop = -100;
				});

				it("and the left side is in", function() {
					element.offsetWidth = 200;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and the right side is in", function() {
					element.offsetLeft = -10;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and both the left and right sides are in", function() {
					element.offsetLeft = 10;
					element.offsetWidth = 50;
					expect(viewport.contains(element)).toBe(false);
				});

			});

			describe("when the left side of the element is to the right of the viewport", function() {

				beforeEach(function() {
					element.offsetLeft = win.innerWidth + win.pageXOffset;
				});

				it("and the top is in", function() {
					element.offsetTop = 1;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and the bottom is in", function() {
					element.offsetTop = -99;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and both the top and bottom is in", function() {
					element.offsetTop = 0;
					element.offsetHeight = 100;
					expect(viewport.contains(element)).toBe(false);
				});

			});

			describe("when the right side of the element is to the left of the viewport", function() {

				beforeEach(function() {
					element.offsetLeft = -100;
				});

				it("and the top is in", function() {
					element.offsetTop = 1;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and the bottom is in", function() {
					element.offsetTop = -99;
					expect(viewport.contains(element)).toBe(false);
				});

				it("and both the top and bottom is in", function() {
					element.offsetTop = 0;
					element.offsetHeight = 100;
					expect(viewport.contains(element)).toBe(false);
				});

			});

			it("when the top-right corner of the element is below the bottom-left corner of the viewport", function() {
				element.offsetTop = 100;
				element.offsetLeft = -100;
				expect(viewport.contains(element)).toBe(false);
			});

			it("when the top-left corner of the element is below the bottom-right corner of the viewport", function() {
				element.offsetTop = 100;
				element.offsetLeft = 100;
				expect(viewport.contains(element)).toBe(false);
			});

			it("when the bottom-right corner of the element is above the top-left corner of the viewport", function() {
				element.offsetTop = -100;
				element.offsetLeft = -100;
				expect(viewport.contains(element)).toBe(false);
			});

			it("when the bottom-left corner of the element is above the top-right corner of the viewport", function() {
				element.offsetTop = -100;
				element.offsetLeft = 100;
				expect(viewport.contains(element)).toBe(false);
			});

		});

		describe("returns true", function() {

			it("when the element is the exact same dimensions and position as the viewport", function() {
				expect(viewport.contains(element)).toBe(true);
			});

			it("when the element is larger in dimensions all around with the viewport inside it", function() {
				element.offsetWidth = 200;
				element.offsetHeight = 200;
				element.offsetLeft = -50;
				element.offsetTop = -50;
				expect(viewport.contains(element)).toBe(true);
			});

			describe("when the element is wider than the viewport", function() {

				beforeEach(function() {
					element.offsetWidth = 200;
					element.offsetLeft = -50;
				});

				it("and overlaps the top", function() {
					element.offsetTop = -99;
					expect(viewport.contains(element)).toBe(true);
				});

				it("and overlaps the bottom", function() {
					element.offsetTop = 99;
					expect(viewport.contains(element)).toBe(true);
				});

			});

			describe("when the element is taller than the viewport", function() {

				beforeEach(function() {
					element.offsetHeight = 200;
					element.offsetTop = -50;
				});

				it("and overlaps the left side", function() {
					element.offsetLeft = -99;
					expect(viewport.contains(element)).toBe(true);
				});

				it("and overlaps the right side", function() {
					element.offsetLeft = 99;
					expect(viewport.contains(element)).toBe(true);
				});

			});

			describe("when the element is smaller than the viewport", function() {

				beforeEach(function() {
					element.offsetWidth = 50;
					element.offsetHeight = 50;
				});

				describe("and overlaps", function() {

					it("the top-left corner", function() {
						element.offsetLeft = -49;
						element.offsetTop = -49;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the top-right corner", function() {
						element.offsetTop = -49;
						element.offsetLeft = 99;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the bottom-left corner", function() {
						element.offsetLeft = -49;
						element.offsetTop = 99;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the bottom-right corner", function() {
						element.offsetTop = 99;
						element.offsetLeft = 99;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the top", function() {
						element.offsetTop = -49;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the bottom", function() {
						element.offsetTop = 99;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the left", function() {
						element.offsetLeft = -1;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the right", function() {
						element.offsetLeft = 99;
						expect(viewport.contains(element)).toBe(true);
					});

				});

				describe("and butts up against", function() {

					it("the top-left", function() {
						expect(viewport.contains(element)).toBe(true);
					});

					it("the top-right", function() {
						element.offsetLeft = 50;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the bottom-right", function() {
						element.offsetTop = 50;
						element.offsetLeft = 50;
						expect(viewport.contains(element)).toBe(true);
					});

					it("the bottom-left", function() {
						element.offsetTop = 50;
						expect(viewport.contains(element)).toBe(true);
					});

				});

			});

		});

	});

});
