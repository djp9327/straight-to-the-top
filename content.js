// content.js

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
            intersection.push(allRoot[i]);
        }
    }
    return getCurrentRoot(intersection);
}

// Determines percentage of screen covered by comment div
function computeScreenPercentage(comment) {
    var windowTop = viewport.top;
    var windowBottom = viewport.bottom;
    var screenSize = windowBottom - windowTop;
    var position = viewport.getElementPosition(comment);
    var size;

    if(position.top < windowTop) {	// comment begins above current window
        if(position.bottom > windowBottom) {	// comment covers entire screen
            return 1;
        } else {
            size = position.bottom - windowTop;
            return size/screenSize;
        }
    } else if(position.bottom > windowBottom) {	// comment ends below current window
        size = windowBottom - position.top;
        return size/screenSize;
    } else {	// comment is entirely contained in screen
        size = position.bottom - position.top;
        return size/screenSize;
    }
}

// Determines which visible root comment div consumes greatest percentage of window
function getCurrentRoot(intersection) {
    var max = 0;
    var maxComment;
    for(var i=0; i < intersection.length; i++) {
        var comment = intersection[i];
        var result = computeScreenPercentage(comment)
        if(result > max) {
            max = result;
            maxComment = comment;
        }
    }
    return maxComment;
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

// Automate scroll on navigation button event
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
    toParent.insertBefore(navigation, toParent.children[0]);
}

var currSiteTable = findIntersection(rootComments, visibleComments);
var currSiteTableInd = rootComments.indexOf(currSiteTable);

var navigation = document.createElement('div');
navigation.className = 'btn-group-vertical';
navigation.style.float = 'right';
up = '<button type="button" id="up" class="btn btn-primary" style="font-size:20px"> <img src=\"'  + chrome.extension.getURL("static/up-arrow.png") + '\"/></button>';
down = '<button type="button" id ="down" class="btn btn-primary" style="font-size:20px"> <img src=\"' + chrome.extension.getURL("static/down-arrow.png") + '\"/</button>';
navigation.style.fontSize = "40px";

navigation.innerHTML = up + down;
rootComments[currSiteTableInd].insertBefore(navigation, rootComments[currSiteTableInd].children[0]);

// Set initial placement
var currentStart = $(currSiteTable).offset().top;
if(!($(window).scrollTop() < currentStart)) {	// scrolling up within current site table
    $(navigation).stop().animate({"marginTop" : $(window).scrollTop() - currentStart + navigation.clientHeight}, "slow");
} else {
    $(navigation).stop().animate({"marginTop" : "0px"}, "slow");
}

var changed = false;
var commentArea = viewport.querySelectorAll(".commentarea");
var userScroll = true;

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

        $(navigation).css("margin-top", "0px");
        $(this).scrollView($(this.clientHeight)[0]);

        if(isLastSiteTable()) {
            $(this).prop("disabled", true)
        }
        $("#up").prop("disabled", false);

    } else if(id == "up") {
        var toSiteTable = rootComments[currSiteTableInd-1];
        moveNavigation(currSiteTable, toSiteTable);
        currSiteTableInd--;
        currSiteTable = rootComments[currSiteTableInd];
        currentStart = $(currSiteTable).offset().top;

        $(navigation).css("margin-top", "0px");
        $(this).scrollView($(this.clientHeight)[0]);

        if(isFirstSiteTable()) {
            $(this).prop("disabled", true);
        }
        $("#down").prop("disabled", false);
    }
});

$(window).on('scroll', _.throttle(moveNavBar, 300, {trailing: true, leading: false}));
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
            var nextScrollPos = $(navigation).offset().top + navigation.clientHeight;
            if(!(nextScrollPos > bottom)) { // scrolling down within current site table
                $(navigation).stop().animate({"marginTop" : $(window).scrollTop() - currentStart + navigation.clientHeight}, "slow");
            }
        } else {
            if(!isLastSiteTable()) {	// scrolling down to next site table (below)
                var toSiteTable = rootComments[currSiteTableInd + 1];
                moveNavigation(currSiteTable, toSiteTable);
                currSiteTableInd++;
                currSiteTable = rootComments[currSiteTableInd];
                currentStart = $(currSiteTable).offset().top;
                //$(navigation).css("cssText", "margin-top: 0px !important");
                navigation.style.float = 'right';
                $(navigation).css("margin-top", $(window).scrollTop() - currentStart + navigation.clientHeight);

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
                $(navigation).stop().animate({"marginTop" : $(window).scrollTop() - currentStart + navigation.clientHeight}, "slow");
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
                $(navigation).css("margin-top", $(window).scrollTop() - currentStart + navigation.clientHeight);

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


