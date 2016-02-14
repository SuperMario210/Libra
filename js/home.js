$(document).ready(function(){
	var fb = new Firebase("https://librabooks.firebaseio.com");
	fb.onAuth(function(authData) {
		$.ajax({
	        type: "GET",
	        url: "http://libra-vmcool09.c9users.io/library/current?userID=" + authData.uid,
	        success: function(data) {
	        	if(data) {
		        	var keys = Object.keys(data);
		        	for(i=0;i<keys.length;i++) {
		        		$('#current').append('<a href="reader.html?id='+keys[i]+'"><div class="book"><img class="book-cover" src="'+data[keys[i]].imgUrl+'"><p class="book-title">'+data[keys[i]].title+'</p><p class="book-author">'+data[keys[i]].author+'</p></div></a>');
		        	}
		        	$("#current").append('<a href="search.html"><div class="add-book"><div style="font-size: 60px;margin-top: 5px;">+</div>Add Book</div></a>');

		        }
	
	        },
	        error: function(data) {
	          alert("Error loading library!");
	        },
	    });
	});
	
});