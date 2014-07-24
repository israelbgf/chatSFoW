$(function () {

    var serverHost = prompt("Tell me the server address to start rocking!") || 'localhost';
    var userEmail = prompt("Now tell me you e-mail bro (we use it for Gravatar images)!") || 'noob@vacilao.com';
    var connection = io.connect('http://' + serverHost + ':1337');

    connection.on('connect', function() {
        console.log('entendi, ou não.');
    });

    connection.on('receiveMessage', function (data) {
        $('#messagesBox').append("<p tooltip><b>" + data.userEmail + "</b>: " + data.messageContent + "</p>");
    });

    $("#inputButton").click(function(event){
        connection.emit('newMessage', {
            messageContent: $("#inputMessage").val(),
            userEmail: userEmail
        });
    });

    $( document ).tooltip({
        items: "[tooltip]",
        content: function() {
            console.log($(this).html());
            var urlRegex = /(https?:\/\/[^\s]+)/g;
            var url = urlRegex.exec($(this).html())[1];
            if (checkURL(url)){
                var image = "<img src='" + url + "'>";
            }
            return image;
        }
    });

    function checkURL(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

});