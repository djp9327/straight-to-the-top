// content.js
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.message === "clicked_browser_action") {
			var viewport = new Viewport(window);
			
			var rootComments = Array.prototype.slice.call($(".comment").has("[data-root|=true]"));
			var visibleComments = viewport.querySelectorAll(".comment");
			var marginStart = 0;
			var currentStart;
			var lastScrollTop = 0;
			
			
			// Finds intersection of sets of comments visible in current viewport and comments that are 'root'
			function findIntersection(allRoot, allVisible) {
				var intersection = [];
				for (var i=0; i<allRoot.length; i++) {
					var comment = allRoot[i];
					var result = allVisible.indexOf(comment);
					if (result != -1) {
						return i;
					}
				}
			}
			
			// Checks to see if the current site table is the last site table in comments section
			function isLastSiteTable() {
				if(currSiteTableInd == rootComments.length - 1){
					return true;
				} else {
					return false;
				}
			}
			
			// Checks to see if the current site table is the first site table in comments section
			function isFirstSiteTable() {
				if(currSiteTableInd == 0){
					return true;
				} else {
					return false;
				}
			}
			
			$.fn.scrollView = function (clientHeight) {
				return this.each(function () {
					$('html, body').animate({
						scrollTop: $(this).offset().top - clientHeight
					}, 1000);
				});
			}
			
			function getScrollDirection() {
				var st = $(window).scrollTop();
				var scrollDirecton;
				if(st > lastScrollTop) {
					scrollDirection = "down";
				} else {
					scrollDirection = "up";
				}
				
				lastScrollTop = st;
				return scrollDirection;
			}
			
			// Determines percentage of parent elemented scrolled through by child element
			function computeScrollPercentage(childElem, parentElem) {
				var childTopOffset = $(childElem).offset().top;
				var childHeight = $(childElem).height();
				var parentTopOffset = $(parentElem).offset().top;
				var parentHeight = $(parentElem).height();
				
				var scrollPercentage = ((childTopOffset + childHeight) - (parentTopOffset)) / parentHeight;
				return scrollPercentage;
			}
			
			// Moves navigation element from one parent to another
			function moveNavigation(fromParent, toParent) {
				fromParent.removeChild(navigation);
				console.log("Margin TOP: " + navigation.style.marginTop);
				toParent.insertBefore(navigation, toParent.children[0]);
			}
			
			function createLineElement(x, y, length, angle) {
				var line = document.createElement("div");
				var styles = 'border: 1px solid black; '
						   + 'width: ' + length + 'px; '
						   + 'height: 0px; '
						   + '-moz-transform: rotate(' + angle + 'rad); '
						   + '-webkit-transform: rotate(' + angle + 'rad); '
						   + '-o-transform: rotate(' + angle + 'rad); '  
						   + '-ms-transform: rotate(' + angle + 'rad); '  
						   + 'position: absolute; '
						   + 'top: ' + y + 'px; '
						   + 'left: ' + x + 'px; ';
				line.setAttribute('style', styles);  
				return line;
			}

			function createLine(x1, y1, x2, y2) {
				var a = x1 - x2,
					b = y1 - y2,
					c = Math.sqrt(a * a + b * b);

				var sx = (x1 + x2) / 2,
					sy = (y1 + y2) / 2;

				var x = sx - c / 2,
					y = sy;

				var alpha = Math.PI - Math.atan2(-b, a);

				return createLineElement(x, y, c, alpha);
			}
			
			
			//var intersection = findIntersection(rootComments, visibleComments);
			//currSiteTable = intersection[0];
			var currSiteTableInd = findIntersection(rootComments, visibleComments);
			var currSiteTable = rootComments[currSiteTableInd];
						
			var navigation = document.createElement('div');
			navigation.className = 'btn-group-vertical';
			navigation.style.float = 'right';
			up = '<button type="button" id="up" class="btn btn-primary" style="font-size:20px"> <img src=\"'  + chrome.extension.getURL("up-arrow.png") + '\"/></button>';
			down = '<button type="button" id ="down" class="btn btn-primary" style="font-size:20px"> <img src=\"' + chrome.extension.getURL("down-arrow.png") + '\"/</button>';
			navigation.style.fontSize = "40px";
			imgSrc = '<img src="up-arrow.png"/>';
			console.log(chrome.extension.getURL("up-arrow.png"));
			
			navigation.innerHTML = up + down;
			rootComments[currSiteTableInd].insertBefore(navigation, rootComments[currSiteTableInd].children[0]);
			//rootComments[currSiteTableInd].insertBefore(pic, rootComments[currSiteTableInd].children[0]);
			//$(navigation).animate({"marginTop" : $(window).scrollTop()});
			var changed = false;
			var commentArea = viewport.querySelectorAll(".commentarea");
			var userScroll = true;
			
			//viewport.addEventListener("scroll:complete", function(viewport, event) {
			// Moving within
			$('.btn').click(function () {
				var id = ($(this).attr('id'));
				userScroll = false;
				
				if(id == "down") {
					var toSiteTable = rootComments[currSiteTableInd+1];
					moveNavigation(currSiteTable, toSiteTable);
					currSiteTableInd++;
					currSiteTable = rootComments[currSiteTableInd];
					currentStart = $(currSiteTable).offset().top;
					
					//$(navigation).css("top", "0px");
					$(navigation).css("margin-top", "0px");
					$(this).scrollView($(this.clientHeight)[0]);
					
					if(isLastSiteTable()) {
						$(this).prop("disabled", true)
						$("#up").prop("disabled", false);
					}
				} else if(id == "up") {
					var toSiteTable = rootComments[currSiteTableInd-1];
					moveNavigation(currSiteTable, toSiteTable);
					currSiteTableInd--;
					currSiteTable = rootComments[currSiteTableInd];
					currentStart = $(currSiteTable).offset().top;
					
					$(navigation).css("top", "0px");
					$(navigation).css("marginTop", "0px");
					$(this).scrollView($(this.clientHeight)[0]);
					
					if(isFirstSiteTable()) {
						$(this).prop("disabled", true);
						$("#down").prop("disabled", false);
					}
				}
			});
			
			$(window).on('scroll', _.throttle(moveNavBar, 500, {trailing: true, leading: false}));
			function moveNavBar () {
				if(!userScroll) {
					userScroll = true;
					return;
				}
				
				var scrollDirection = getScrollDirection();
				currentStart = $(currSiteTable).offset().top;
				var bottom = $(currSiteTable).height() + currentStart;
				if(scrollDirection == "down") {
					if(viewport.contains(currSiteTable)) {
						var nextScrollPos = $(navigation).offset().top + 93;
						if(!(nextScrollPos > bottom)) { // scrolling down within current site table
							$(navigation).stop().animate({"marginTop" : $(window).scrollTop() - currentStart + 93}, "slow");
						}
					} else {
						if(!isLastSiteTable()) {	// scrolling down to next site table (below)
							var toSiteTable = rootComments[currSiteTableInd + 1];
							moveNavigation(currSiteTable, toSiteTable);
							currSiteTableInd++;
							currSiteTable = rootComments[currSiteTableInd];
							currentStart = $(currSiteTable).offset().top;
							$(navigation).css("cssText", "margin-top: 0px !important");
							navigation.style.float = 'right';
							
							// disable down arrow if last site table
							if(isLastSiteTable()) {
								$("#down").prop("disabled", true);
							}
							
							// enable up arrow automatically
							$("#up").prop("disabled", false);
						}
					}
				} else {	// scroll direction = "up"
					if(viewport.contains(currSiteTable)) {
						if(!($(window).scrollTop() < currentStart)) {	// scrolling up within current site table
							$(navigation).stop().animate({"marginTop" : $(window).scrollTop() - currentStart + 93}, "slow");
						} else {
							$(navigation).stop().animate({"marginTop" : "0px"}, "slow");
						}
					} else {
						if(!isFirstSiteTable()) {	// scrolling up to next site table (above)
							var toSiteTable = rootComments[currSiteTableInd - 1];
							moveNavigation(currSiteTable, toSiteTable);
							currSiteTableInd--;
							currSiteTable = rootComments[currSiteTableInd];
							currentStart = $(currSiteTable).offset().top;
							$(navigation).css("margin-top", $(window).scrollTop() + currentStart + 93);
							
							// disable up arrow if first site table
							if(isFirstSiteTable()) {
								$("#up").prop("disabled", true);
							}
							
							// enable down arrow automatically
							$("#down").prop("disabled", false);
						}
					}
				}
			}
		}
		
	}
)