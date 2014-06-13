/*
(function(Top5){
    var z = function(){};
    Top5.r = function(){};
}(window.Top5 = window.Top5||{}));
Top5.z(); //Won't work.
Top5.r(); //Will.
var zzz = function x() {};
zzz();
*/
//Change to new database structure! :D


var ref = new Firebase("https://second-login-appy.firebaseio.com/");
myUser = -1;
var userRef;
var loadRef;
var loadedList = -1;
var lastfm = new LastFM({ //**Is there a simple way to obscure API keys?**
  apiKey    : 'edfe190dd2cd16dbcc0344f2e3fb942d',
  apiSecret : '697612f8d29ee89adeaa5b6f2df77900'
});
var searchTimeoutThread = null; 

var authClient = new FirebaseSimpleLogin(ref, function (error, user) {
    if (error) {
        alert(error);
        return;
    }
    if (user) {
        // User is already logged in.
        console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
        myUser = user;
        var lastChild;
        userRef = new Firebase("https://second-login-appy.firebaseio.com/users/" + myUser.id);
        userRef.child('lists').once('child_added', function(snapshot) {
            list = snapshot.name(); //Find the most recently added list.
            if(snapshot.val() === null) {
                alert('List does not exist.');
            } else {
                //Load the first list the user created. (Make this the most recent one!)
                loadList(list);
            }
        });
        updateDropdown();
        console.log('logged in');
    } else {
        // User is logged out.
        console.log('logged out');
    }
});

function doLogin(email, password) {
    authClient.login('password', {
        email: email,
        password: password
    });
};

$('#register').on('click', function () {
    var email = $("#register-email").val();
    var password = $("#register-password").val();
    authClient.createUser(email, password, function (error, user) {
        if (!error) {
            console.log('logging new registered user');
            doLogin(email, password);
            $('#modal-register').modal('toggle');
            //Clear out all list HTML and make name editable.
            generateNewList();
            updateDropdown();
        } else {alert(error);}
    });
});

$("#login").on('click', function () {
    console.log('trying to login: ' + $("#login-email").val());

    var email = $("#login-email").val();
    var password = $("#login-password").val();
    doLogin(email, password);
    $('#modal-login').modal('toggle');
});
//Use this code for logging out
$("#logout").click(function () {
    authClient.logout();
    location.reload();
});

$('#modal-login').on('shown.bs.modal', function(){
    $('#login-email').focus();
});
$('#modal-register').on('shown.bs.modal', function(){
    $('#register-email').focus();
});

$('#login-password').keypress(function(e) {
    if(e.which == 13) {
        $('#login').trigger('click');
    }
});
$('#register-password').keypress(function(e) {
    if(e.which == 13) {
        $('#register').trigger('click');
    }
});

function updateSearch(searchTerms, listItem) {
    if (searchTerms != "") {
    lastfm.album.search({limit: 4, album: searchTerms},
                        {success: function(data){
                            $('#search-results').empty();
                            for (var i=0; i< 4; i++) {
                                var thisAlbum = data.results.albummatches.album[i];
                                //$('<div/>').text(thisAlbum.name).appendTo($('#search-results'))
                                //.prepend($('<img/>').attr('src', thisAlbum.image[1]['#text']));
                                $([
                                    '<a class="search-result-item list-group-item"><div class="row">',
                                        '<div class="search-thumbnail-box col-xs-3"><img class="img-rounded img-responsive" src="',thisAlbum.image[2]['#text'],'" alt=""/></div>',
                                        '<div class="col-xs-9">',
                                            '<h1 class="search-title list-group-item-heading">',thisAlbum.name,'</h1>',
                                            '<p class="search-artist list-group-item-text">',thisAlbum.artist,'</p>',
                                        '</div>',              
                                    '</div></a>'
                                    ].join("")).hide().appendTo('#search-results').fadeIn(300);
                                //This code helps reposition the search results window correctly for responsive layouts.
                                if ($('.jumbotron').css('padding-top') == "0px") { //If xs or sm.
                                    var offset = listItem.offset();
                                    $('#search-results').css({
                                        'position': "absolute",
                                        'top': offset.top-180+"px"
                                    }) 
                                } else {                                            //If md or lg
                                    var offset = listItem.offset();
                                    $('#search-results').css({
                                        'position': "absolute",
                                        'top': offset.top-302+"px"
                                    })
                                }
                                //Handlers for each search result item:
                                $('.search-result-item').on('click', function(event) {
                                    //Set the listItem's properties to those of the clicked search result.
                                    listItem.find('.list-image').attr('src', $(this).find('img').attr('src')).css('padding-bottom', '0');
                                    listItem.find('.list-title').text($(this).find('.search-title').text());
                                    listItem.find('.list-artist').text($(this).find('.search-artist').text());
                                    //Hide the search bar, show the search icon.
                                    listItem.find('.list-input').hide();
                                    listItem.find('.list-search-button').fadeIn(300);
                                    $('#search-results').empty();
                                });
                            }
                        }, error: function(code, message) {
                            console.log("Error: " + code + ": " + message);
                            if (error = 6) {
                                $('#search-results').empty();
                            }
                        }});
    }
    else {
        $('#search-results').empty();
    }
}
var generateNewList = function() {
    $('.list-title').text('');
    $('.list-artist').text('');
    $('.list-image').attr('src', "");
    $('.list-input').show();
    $('.list-search-button').hide();
    $('.list-name').text('New List').click();   
}
//DONE updating!
var updateDropdown = function() {
    $('.user-list').remove();
    listRef = new Firebase("https://second-login-appy.firebaseio.com/users/" + myUser.id + "/lists/");
    listRef.once('value', function(snapshot) {
        /*snapshot.forEach(function(child) {
            var listName = child.child('listName').val(); //Gets the listName of each list.
            $(['<li class="user-list" data-ref="', child.name() ,'"><a>', listName,'</a></li>'].join("")).appendTo($('.album-list-dropdown ul'));
        })*/
        $( '.user-list' ).on( 'click', function( event ) {
            var target = $( event.currentTarget ).attr('data-ref');
            //Load the selected list.
            console.log('calling loadList() from updateDropdown()')
            loadList(target);
            //Close dropdown.
            $( event.currentTarget ).closest( '.btn-group' ).children( '.dropdown-toggle' ).dropdown( 'toggle' );
            return false;
        });
    });
}
//DONE updating (probably)!
var loadList = function(listName) {
    console.log("attempting to load " + listName);
    loadRef = new Firebase("https://second-login-appy.firebaseio.com/users/" + myUser.id + "/lists/" + listName); 
    loadRef.on('child_added', function(childSnapshot) {
        //For each number 1-5, find the list-item box and fill it with the data from the list.
        var itemNum = $('#list-item-' + childSnapshot.name());
        itemNum.find('.list-image').attr('src', childSnapshot.val().img);
        itemNum.find('.list-title').text(childSnapshot.val().title);
        itemNum.find('.list-artist').text(childSnapshot.val().artist);
        itemNum.find('.list-input').trigger('blur');
        itemNum.find('.list-search-button').trigger('click');
    });
    //Update the list name HTML with the one stored on the server.
    loadRef.once('value', function(childSnapshot) {
        $('.list-name').text(childSnapshot.child('listName').val());
        $('#list-link').text(childSnapshot.child('listName').val())
    })
    $('.list-input').each(function(){$(this).val("").blur()}); 
    //Enter the loaded list's ID into loadedList. 
    loadedList = listName;
    console.log("[loadList()] loadedList = " + loadedList);
    var listURL = '/list.php?u=' + myUser.id + '&id=' + listName;
    console.log(listURL);
    $('#list-link').attr('href', listURL);
}
//DONE updating (needs testing)
var saveList = function(){
    var listName = $('.list-name').text();
    var targetList;
    //If a user is logged in...
    if (myUser != -1) {
        //If no list is currently loaded, create a new one...
        if (loadedList === -1) {
            //targetList is now a new unique ID created under the user's lists.
            console.log(userRef.child('lists').toString())
            targetList = userRef.child('lists').push();
            console.log('[saveList()] loadedList is now the NEW list at ' + targetList.name())
            loadedList = targetList.name();
        } else {
            //If a list is currently loaded, targetList will now point to it.
            console.log('testing : loadedList is ' + loadedList);
            targetList = userRef.child('lists').child(loadedList);
        }
        //Set the server data based on the HTML.
        $('.list-group-item').each(function(){
            var itemRank = $(this).index()+1; //Returns the rank of the current item in the loop (1-5).
            var img = $(this).find('.list-image').attr('src');
            var title = $(this).find('.list-title').text();
            var artist = $(this).find('.list-artist').text();
            targetList.child(itemRank).set({
                'title': title,
                'artist': artist,
                'img': img
            });
        });
        targetList.child('listName').set(listName);
        updateDropdown();
    } else {
        //If no user is logged in, save the list as a public list and give the user a URL to share it.
    }
}
//DONE editing (needs testing)
var updateListName = function(listNameEdit) {
    listNameEdit.hide();
    if (listNameEdit.val().trim() == "") { //Filler text if there is nothing entered.
        $('.list-name').text("My Top Albums").show();
    } else {
         $('.list-name').text(listNameEdit.val()).show();
    }
    if (myUser != -1) { //If logged in, immediately save the new name.
        //TEST THIS FEATURE.
        //userRef.child('lists').child(loadedList).set({ 'listName' : $('.list-name').text() })
    }
}

$('.list-input').on('keyup click', function() {
    clearTimeout(searchTimeoutThread);
    var $this = $(this); 
    var $listItemParent = $this.closest('.list-group-item');
    //Update the search results 400ms after the last keyup stroke.
    searchTimeoutThread = setTimeout(function(){updateSearch($this.val(), $listItemParent)}, 400);
}).on('blur', function(e) {
    if ($(this).closest('.list-group-item').find('.list-title').text() != "") { //If there is something in the .list-title
        $(this).hide();
        $(this).closest('.list-group-item').find('.list-search-button').fadeIn(300);
    }
}).on('click', function(){
    $('.navbar-collapse.in').collapse('hide');
});

$('.save').on('click', function() {
    if($('.list-name').text() == 'New List') { 
        alert("Please enter a name for your list!");
    } else {
        saveList(); 
    }
});

//Show list input when the spyglass icon is clicked.
$('.list-search-button').on('click', function() {
    $(this).closest('.list-group-item').find($('.list-input')).fadeIn(300).focus().select().trigger('keyup');
    $(this).hide();
})
//When the list name is clicked, show the input to change it.
$('.list-name').on('click', function(){
    $(this).hide();
    $('.list-name-edit').val($(this).text()).show().select();
})
//When a new list name is entered, remove input and show it in <p> form.
$('.list-name-edit').on('blur', function() {
    updateListName($(this));
}).on('keypress', function(event) {
    if (event.which == 13) {
        $(this).blur();
    }
});
//Creation of a new list. **CHANGE FOR NEW DATA STRUCTURE. AUTO SAVE WHEN CREATED? OR ONLY SAVE AFTER BEIGN FILLED IN?
$('.new-user-list').on('click', function(){
    console.log('.new-user-list clicked. Unloading previous list from loadedList');
    loadedList = -1;
    // Empty out all list HTML, and make the name "New List" and select it.
    generateNewList();
    // Close Dropdown 
    $( event.currentTarget ).closest( '.btn-group' ).children( '.dropdown-toggle' ).dropdown( 'toggle' );

    return false;
})

//Hide the search window when resizing.
$(window).on('resize', function(){
    $('#search-results').empty();
});
$('html').on('click', function() {
    if ($('.jumbotron').css('padding-top') == "0px") { //If xs or sm.
        $('#search-results').empty();
        $('.navbar-collapse').collapse('hide');
    }
})
$('#search-results').on('click', function(e){
    e.stopPropagation();    
})

$('.modal-footer button').click(function(){
    $('.modal').modal('close');
    return false;
})

//Collapse the navbar because it forgets sometimes :)
$('.navbar-collapse').collapse('hide');


