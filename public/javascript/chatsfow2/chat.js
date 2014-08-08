var ChatCommand = function(){

    var connection, userEmail;
    var $inputMessage = $("#inputMessage");
    var $messageBox = $('#messagesBox');

    return {

        init: function(serverAddress, restrictedMode){
            userEmail = restrictedMode || prompt("Now tell me you e-mail bro (we use it for Gravatar images)!", "dude'o");
            connection = io.connect('http://' + serverAddress + ':1337');

            $inputMessage.focus();

            connection.on('forceClientEmail', function(data) {
                userEmail = data.email;
                connection.emit("message", {userEmail: userEmail});
            });

            var hasNotAlreadyFetchedHistory = true;
            connection.on('chatHistoryLoad', function(chatMessages) {
                if(hasNotAlreadyFetchedHistory){
                    chatMessages.forEach(function(chatMessage){
                        addMessageToChatBox(chatMessage);
                    });
                    hasNotAlreadyFetchedHistory = false;
                }
            });

            connection.on('userJoined', function(user) {
                ChatCommand.scrollToBottom();
                var html = "<div class='joined'>";
                html += "<b>(" + user + ")</b>";
                html += " entered the room.</div>";
                $("#messagesBox").append(html);
            });

            connection.on('userDisconnected', function(user) {
                ChatCommand.scrollToBottom();
                var html = "<div class='exited'>";
                html += "<b>(" + user + ")</b>";
                html += " exited the room.</div>";
                $("#messagesBox").append(html);
            });
            
            connection.on('receiveMessage', addMessageToChatBox);

            $(document).tooltip({
                items: "[tooltip], [avatar]",
                position: {
                    my: "center bottom-25",
                    at: "center top",
                    collision: "flipfit flip",
                    using: function( position, feedback ) {
                        $(this).css( position );
                        $("<div>")
                            .addClass( "ui-tooltip-arrow" )
                            .addClass( feedback.vertical )
                            .addClass( feedback.horizontal )
                            .appendTo( this );
                    }
                },
                content: function() {
                    var element = $( this );
                    if (element.is("[tooltip]")) {
                        var url = $(this).attr("href")
                        return isImage(url) ? "<img src='" + url + "'>" : false;
                    } else {
                        var url = $(this).attr("data-img")
                        return "<img src='" + url + "'>";
                    }
                }
            });

            function isImage(url) {
                return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
            }

            function urlify(text) {
                var urlRegex = /(https?:\/\/[^\s]+)/g;
                return text.replace(urlRegex, '<a tooltip href="$1" target="_blank">$1</a>');
            }

            function addMessageToChatBox(data){
                ChatCommand.scrollToBottom();

                $messageBox.append(
                    '<div class="containerChat">'+
                        '<img class="imgAvatar" src="'+data.avatar+'" />'+
                        '<span class="nomeAvatar">'+data.userEmail+'</span>'+
                        '<span class="horaAvatar">'+data.timestamp+'</span>'+
                        '<span class="textoChat">'+urlify(data.messageContent)+'</span>'+
                        '<div class="clearfix"></div>'+
                     '</div>'
                );

              /*  $messageBox.append("<div><b>(" +
                    data.timestamp + ") " +
                    "<span avatar data-img='" + data.avatar + "'>" + data.userEmail + "</span></b>: " +
                    urlify(data.messageContent) + "</div>");
                */

                if(data.userEmail != userEmail){
                    $.titleAlert("New chat message!", {
                        stopOnFocus: true,
                        requireBlur: true
                    });
                }
            };

        },

        execute: function(chatMessage) {
            var message = removeHTMLTags(chatMessage);
            if (message.trim() > "" ) {
                connection.emit('newMessage', {
                    messageContent: message,
                    userEmail: userEmail
                });
                $inputMessage.val("").focus();
            }
        },

        scrollToBottom: function () {
            var scrollHeight = $messageBox.prop("scrollHeight");
            var outerHeight = $messageBox.scrollTop() + $messageBox.outerHeight();

            if (scrollHeight === outerHeight) {
                setTimeout(function() {$messageBox.scrollTop($messageBox.prop("scrollHeight"))}, 100);
            }
        },

        on: function (event, callback) {
            connection.on(event, callback);
        },

        emit: function (event, callback) {
            connection.emit(event, callback);
        }
    }

    function removeHTMLTags(text) {
        var regex = /(<([^>]+)>)/ig
        return text.replace(regex, "").replace(/(&nbsp)*/g,"");
    }                

}();