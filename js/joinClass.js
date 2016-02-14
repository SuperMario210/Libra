function searchClass() {
    var classId = $("#searchBar").val();
    $.ajax({
        type: "GET",
        url: "http://libra-vmcool09.c9users.io/classroom/info?classID=" + classId,
        success: function(data) {
            $("#placeHolder").html('<div class="login fade-in"><h2 class="login-header">Join class</h2><div class="form-group"><br><p><span class="bolded">Name: </span>'+data.name+'</p><p><span class="bolded">Teacher: </span>'+data.teachers[0]+'</p></div><button onclick="joinClass(\''+classId+'\')" class="block-button">Join</button></div>');
        },
        error: function(data) {
          alert("That is not a valid class ID!");
        },
      });
}

function joinClass(classId) {
    $.ajax({
        type: "GET",
        url: "http://libra-vmcool09.c9users.io/classes/join?userID="+uid+"&classID="+classId,
        success: function(data) {
            window.location = "teacher.html";
        },
        error: function(data) {
          alert("Failed to join class!");
        },
      });
}

$(document).ready(function(){
    $('#searchBar').on('input', function() {
        $("#placeHolder").html("");
    });
});