var pageStart = 0;
var pageEnd = 0;
var selectionStart;
var selectionEnd;
var book = {};
var chapters= ["Test"];
var highlights = [];
var chapterNumber = 0;
var chapter;
var bookId;
var words;

$(document).ready(function() {
	$(".reader").html("<img src='img/loading.gif'>");
	bookId = getUrlParameter('id');
	var fb = new Firebase("https://librabooks.firebaseio.com");
	$.ajax({
        type: "GET",
        url: "http://libra-vmcool09.c9users.io/books/chapters?bookID=" + bookId,
        success: function(data) {
        	book = data;
        	fb.onAuth(function(authData) {
		fb.child("users/"+authData.uid+"/books").child(bookId).child("highlights").once("value", function(data) {
			if(data.val()) {
				highlights=data.val();
				applyHighlights();
			}
			else {
				highlights=[];
			}
		});
		fb.child("users/"+authData.uid+"/books").child(bookId).child("position").once("value", function(data) {
			if(data.val()) {
				pageStart=data.val().location;
				chapterNumber=data.val().chapter;
				chapter = book[chapterNumber]['text'];
				words = chapter.split(" ");
				displayPage(pageStart);
			}
			else {
				pageStart=0;
				chapterNumber=0;
				chapter = book[chapterNumber]['text'];
				words = chapter.split(" ");
				displayPage(pageStart);
			}
		});
	});
        },
        error: function(data) {
          alert("Not a valid book Id!");
        },
      });
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        flipLeft();

        case 39: // right
        flipRight();

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

function applyHighlights() {
	if(highlights[chapterNumber]) {
		var chapterHighlights = highlights[chapterNumber];
		console.log(chapterHighlights);
		for(j=0; j<chapterHighlights.length; j++) {
			highlight(chapterHighlights[j].color, chapterHighlights[j].start, chapterHighlights[j].end, false)
		}
	}
}

function displayPage(start){
	if(start<words.length) {
		$("#reader").html("");
		var count = start;
		var height = document.getElementById('reader').clientHeight;
		if(start==0) {
			$("#reader").append("<h1 class='chapter-title'>"+book[chapterNumber]['title']+"</h1>");
		}
		while(true) {
			if(words[count].indexOf("<P>") >= 0)
				$("#reader").append("<span class='indent' id='"+count+"'>"+words[count].replace("<P>","")+"&nbsp;</span>");
			else if(words[count].indexOf("</P>") >= 0) {
				$("#reader").append("<span id='"+count+"'>"+words[count].replace("</P>","")+" </span><br>");
			}
			else {
				$("#reader").append("<span id='"+count+"'>"+words[count]+" </span>");
			}
			count++;
			console.log($("#reader").height());
			var div = document.getElementById('reader'); 
			if(div.clientHeight>height||count>words.length-1) 
				break;
		}
		pageStart = start;
		recordLocation(0);
		pageEnd = count;
		$("#"+pageEnd).remove();
		applyHighlights();
	}
	else {
		console.log("next")
		nextChapter();
	}
};

function nextChapter() {
	if(chapterNumber<book.length-1) {
		chapterNumber++;
		chapter = book[chapterNumber]['text'];
		words = chapter.split(" ");
		displayPage(0);
	}
}

function prevChapter() {
	if(chapterNumber>0) {
		chapterNumber--;
		chapter = book[chapterNumber]['text'];
		words = chapter.split(" ");
		pageStart = words.length-1;
		flipLeft();
	}
}

function flipRight() {
	displayPage(pageEnd);
	console.log(pageStart+", "+pageEnd)
}

function flipLeft() {
	if(pageStart==0) {
		prevChapter();
	}
	else if(pageStart<=250) {
		$("#reader").html("");
		displayPage(0);
	}
	else {
		$("#reader").html("");
		var count = pageStart-1;
		var height = document.getElementById('reader').clientHeight;
		while(true) {
			if(words[count].indexOf("<P>") >= 0)
				$("#reader").prepend("<span class='indent' id='"+count+"'>"+words[count].replace("<P>","")+"&nbsp;</span>");
			else if(words[count].indexOf("</P>") >= 0) {
				$("#reader").prepend("<span id='"+count+"'>"+words[count].replace("</P>","")+" </span><br>");
			}
			else {
				$("#reader").prepend("<span id='"+count+"'>"+words[count]+" </span>");
			}
			count--;
			console.log($("#reader").height());
			var div = document.getElementById('reader'); 
			if(div.clientHeight>height||count<0) 
				break;
		}
		pageEnd = pageStart-1;
		pageStart = count+1;
		recordLocation(1);
		console.log(pageStart+", "+pageEnd)
		$("#"+pageStart).remove();
		applyHighlights();
		if(pageStart<=1) {
			displayPage(0);
		}
		
	}
}

function recordLocation(add) {
	var fb = new Firebase("https://librabooks.firebaseio.com");
	fb.onAuth(function(authData) {
		fb.child("users/"+authData.uid+"/books").child(bookId).child("position").set({chapter:chapterNumber,location:pageStart+(add)});
	});
}

function highlight(color, start, end, add) {
	if(add) {
		if(highlights[chapterNumber])
			highlights[chapterNumber].push({color:color,start:start,end:end});
		else {
			highlights[chapterNumber] = [];
			highlights[chapterNumber].push({color:color,start:start,end:end});
		}
		var fb = new Firebase("https://librabooks.firebaseio.com");
		fb.onAuth(function(authData) {
			fb.child("users/"+authData.uid+"/books").child(bookId).child("highlights").set(highlights);
			console.log("setting highlights");
		});
	}
	for(i=start; i<=end; i++) {
		$("#"+i).addClass(color);
		$("#"+i).addClass(start+end);
	}
	$("."+start+end).click(function(){
		$(".removehighlight").remove();
		$("<div class='removehighlight'><i class='fa fa-trash-o' id='deleteHighlight'></i></div>").insertBefore( "#"+start );
		$("#deleteHighlight").mousedown(function(){
			$("."+start+end).removeClass(color);
			$("."+start+end).removeClass(start+end);
			$(".removehighlight").remove();
			for(i=0; i<highlights[chapterNumber].length; i++) {
				console.log(highlights[chapterNumber][i].start+" "+start+" "+highlights[chapterNumber][i].end+" "+end+" "+highlights[chapterNumber][i].color+" "+color+" "+i);
				console.log(highlights);
				if(highlights[chapterNumber][i].start==start&&highlights[chapterNumber][i].end==end&&highlights[chapterNumber][i].color==color) {
					console.log(highlights);
					console.log("removing at index "+i);
					highlights[chapterNumber].splice(i,1);
					console.log(highlights);
					var fb = new Firebase("https://librabooks.firebaseio.com");
					fb.onAuth(function(authData) {
						fb.child("users/"+authData.uid+"/books").child(bookId).child("highlights").set(highlights);
						console.log("setting highlights");
					});
					break;
				}
			}
		});
	});
}

var down = false;
$(document).mousedown(function() {
    down = true;
}).mouseup(function() {
    down = false;  
    if(getSelectionBoundaryElement(false).id-getSelectionBoundaryElement(true).id>0) {
    	$(".highlight").remove();
    	$( "<div class='highlight'><span class='highlight-color red'></span><span class='highlight-color yellow'></span><span class='highlight-color green'></span><span class='highlight-color blue'></span></div>" ).insertBefore( "#"+getSelectionBoundaryElement(true).id );
    	selectionStart = getSelectionBoundaryElement(true).id;
    	selectionEnd = getSelectionBoundaryElement(false).id;
    	$(".red").mousedown(function() {highlight("redHighlighted",selectionStart,selectionEnd,true);});
    	$(".yellow").mousedown(function() {highlight("yellowHighlighted",selectionStart,selectionEnd,true);});
    	$(".green").mousedown(function() {highlight("greenHighlighted",selectionStart,selectionEnd,true);});
		$(".removehighlight").remove();
    	$(".blue").mousedown(function() {highlight("blueHighlighted",selectionStart,selectionEnd,true);});
    }
    else {
    	$(".highlight").remove();
    }
});

function getSelectionBoundaryElement(isStart) {
   var range, sel, container;
   if (document.selection) {
       range = document.selection.createRange();
       range.collapse(isStart);
       return range.parentElement();
   } else {
       sel = window.getSelection();
       if (sel.getRangeAt) {
           if (sel.rangeCount > 0) {
               range = sel.getRangeAt(0);
           }
       } else {
           // Old WebKit
           range = document.createRange();
           range.setStart(sel.anchorNode, sel.anchorOffset);
           range.setEnd(sel.focusNode, sel.focusOffset);

           // Handle the case when the selection was selected backwards (from the end to the start in the document)
           if (range.collapsed !== sel.isCollapsed) {
               range.setStart(sel.focusNode, sel.focusOffset);
               range.setEnd(sel.anchorNode, sel.anchorOffset);
           }
      }

       if (range) {
          container = range[isStart ? "startContainer" : "endContainer"];

          // Check if the container is a text node and return its parent if so
          return container.nodeType === 3 ? container.parentNode : container;
       }   
   }
}