$(document).ready(function() {
        var socket = io.connect();  /*load the socket.io-client, which exposes a io global, and then connect.*/
             var $nickForm = $('#nickForm');
             var $nickError = $('#nickError');
             var $nickBox = $('#nickname');
             var $users = $('#users');
             var $messageForm = $('#sendMessage');
             var $messageBox = $('#messageBox');
             var $chatList = $('#chatList');
             var $chatWrap = $('#chatWrap');
             var $pmForm = $('#sendPM');
             var $pmWrap = $('#pmWrap');
             var $pmList = $('#pmList');
             var $pmBox = $('#pmBox');

            $(document).on("submit", "#nickForm", function(e){
              e.preventDefault();
               
              if($nickBox.val().trim() != '')
              {
                socket.emit('new user', $nickBox.val(), function(callback) {
                  if(callback){
                    $('#nickWrap').hide();
                    $('#chatContent').show();
                          
                  } else {
                    $nickError.text('That username is already taken! Please try again!');
                  }
                });

              } 
               
            });

            //online users
          
            socket.on('usernames', function(data) {
              var html = '<h3 id="userHeading">Online Users</h3><hr>';

              for(i=0;i< data.allusers.length; i++) {
                //testing data value
                //$('#test').append(data.allusers[i] + ':' + data.thisuser +'<br>');
                /*if(data.allusers[i] != data.thisuser)
                  $('#test').append(data.allusers[i]+ '!='+ data.thisuser+'<br>');
                else 
                  $('#test').append(data.allusers[i]+ '=='+ data.thisuser+'<br>');
                */
                if(data.allusers[i] != $('#nickname').val()) {
                  html += '<span><button id="clickUser">';
                  html += data.allusers[i];
                  html += '</button></span><br>';
                }
                else {
                  html += '<span style="padding-left:8px"><strong>';
                  html += data.allusers[i];
                  html += '</strong></span><br>';
                }
              }
              $users.html(html);
              $users.css("overflow", "auto");
               
            });
           
            function mainChatScrollDown() {
              $chatWrap.animate({ scrollTop: $(window).height() }, "fast");
            }

             //on user connect
             socket.on('user joined', function(data) {
               $chatList.append('<li id="joinleftMsg"><strong>'+ data.nick + '</strong>' + ' joined<li>');
               mainChatScrollDown();              

             });

             //chat message sent
            $messageForm.submit(function(e){
              e.preventDefault();
              
              if($messageBox.val().trim() != ''){
                socket.emit('send msg', $messageBox.val());
                var nicklink1 = '<span><strong>'+ $nickBox.val() +'</strong></span> ';
                $chatList.append('<li id="publicMsg" style="padding:2px 8px 2px 8px;">'+ nicklink1 + '  : ' + $messageBox.val() + '</li>');
                mainChatScrollDown();
                $messageBox.val('');
                return false;
              }
            });
       
            //recd msg from server
            socket.on('new msg', function(data){
              var nicklink2 = '<span><button id="clickUser"><strong>'+data.nick+'</strong></button></span>';
              $chatList.append('<li id="publicMsg">'+ nicklink2 + ': ' + data.message + '</li>');
              mainChatScrollDown();
            });

           /*****PM handling*******/ 

            function pmChatScrollDown() {

              $pmWrap.animate({ scrollTop: $(window).height() }, "slow");
            }

            $(document).on("click", "#clickUser", function(){
              var $pmForm = $('#sendPM');
              //var $pmWrap = $('#pmWrap');
              var $pmList = $('#pmList');
              var $pmBox = $('#pmBox');
              var userclicked = $(this).text();
              $pmWrap.css("visibility","visible");
              $('#otherguy').text(userclicked);
              $pmList.append('<hr>');
              
              //pm message sent
              $pmForm.submit(function(e){
                e.preventDefault();
                newpm = $pmBox.val().trim();
                if(newpm != ''){
                  socket.emit('send pm', {msg: newpm, to: userclicked});
                  pmChatScrollDown();
                  $pmBox.val('');
                  
                  return false;
                }
                $pmBox.val('');
              });

            });

            $("#sendPM").on("submit", function(e){
              e.preventDefault();
              var touser = $('#otherguy').text();
              var $pmBox = $('#pmBox');

              if(touser != '') {
                /*$pmForm.on("submit", function(e){
                  e.preventDefault(); */
                  newpm = $pmBox.val().trim();
                  if(newpm != ''){
                    socket.emit('send pm', {msg: newpm, to: touser});
                    pmChatScrollDown();
                    $pmBox.val('');
                    return false;
                  }
              //});
              }
            });

            socket.on('pmmyself', function(data){
              $pmList.append('<li id="privateMsg"><strong>me' + '</strong>: ' + data.message + '</li>');
              $pmBox.val('');
            });
            
            socket.on('new pm', function(data) {

              $pmWrap.css("visibility","visible");
              $('#otherguy').text(data.nick);
              
              //var nicklink = '<button id="clickUser"><strong>'+data.nick+'</strong></button>';
              $pmList.append('<li id="privateMsg"><strong>'+ data.nick + '</strong>: ' + data.message + '</li>');
              pmChatScrollDown();

            });
            

           /************/
            
             //on user disconnect
             socket.on('user left', function(data) {
               $chatList.append('<li id="joinleftMsg"><strong>'+ data.nick + '</strong>' + ' left<li>');
               mainChatScrollDown();
            });
    });