//Hey!

var ref = new Firebase("https://second-login-appy.firebaseio.com/");
myUser = -1;
var userRef;
var loadRef;
var loadedList;
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
        userRef.once('child_added', function(snapshot) {
            list = snapshot.val(); //Find the most recently added list.
            if(snapshot.val() === null) {
                alert('List does not exist.');
            } else {
                console.log(list);
                $('.list-name').text(snapshot.name());
                loadedList = snapshot.name();
                console.log("loadedList = " + loadedList);
                snapshot.forEach(function(childSnapshot) { //Iterate over each item in the list.
                    $('#list-item-' + childSnapshot.getPriority()).find('.list-image').attr('src', childSnapshot.val().img);
                    $('#list-item-' + childSnapshot.getPriority()).find('.list-title').text(childSnapshot.val().title);
                    $('#list-item-' + childSnapshot.getPriority()).find('.list-artist').text(childSnapshot.val().artist);
                    $('#list-item-' + childSnapshot.getPriority()).find('.list-input').trigger('blur');
                });
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
            //Clear out list HTML-- should probably create a function to do all this. Find a way to make it useable for New List too.
            $('.list-title').text('');
            $('.list-artist').text('');
            $('.list-input-col').find('.list-input').show();
            $('.list-image').attr('src', "");
            $('.list-search-button').hide();
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

var updateDropdown = function() {
    $('.album-list-dropdown ul').remove(".user-list");
    userRef.once('value', function(snapshot) {
        snapshot.forEach(function(child) {
            var listName = child.name();
            console.log(listName);
            $(['<li class="user-list"><a>', listName,'</a></li>'].join("")).appendTo($('.album-list-dropdown ul'));
        })
        $( '.user-list' ).on( 'click', function( event ) {
            var $target = $( event.currentTarget ).text();
            loadList($target);
            //Close dropdown.
            $( event.currentTarget ).closest( '.btn-group' ).children( '.dropdown-toggle' ).dropdown( 'toggle' );
            return false;
        });
    });
}
var loadList = function(listName) {
    console.log("attempting to load " + listName);
    loadRef = new Firebase("https://second-login-appy.firebaseio.com/users/" + myUser.id + "/" + listName);
    loadRef.on('child_added', function(childSnapshot) {
        //Probably not a great idea to use Priority when I could be using the ranking numbers as .name(); (Check if possible)
        $('#list-item-' + childSnapshot.getPriority()).find('.list-image').attr('src', childSnapshot.val().img);
        $('#list-item-' + childSnapshot.getPriority()).find('.list-title').text(childSnapshot.val().title);
        $('#list-item-' + childSnapshot.getPriority()).find('.list-artist').text(childSnapshot.val().artist);
        $('#list-item-' + childSnapshot.getPriority()).find('.list-input').trigger('blur');
        $('#list-item-' + childSnapshot.getPriority()).find('.list-search-button').trigger('click');
    });
        $('.list-input').each(function(){$(this).val("").blur()});
        $('.list-name').text(listName);  
        loadedList = listName;
        console.log("loadedList = " + loadedList);
}
var saveList = function(listName){
    $('.list-group-item').each(function(){
        var itemRank = $(this).index()+1; //Returns the rank of the current item in the loop (1-5).
        var img = $(this).find('.list-image').attr('src');
        var title = $(this).find('.list-title').text();
        var artist = $(this).find('.list-artist').text();
        //**CHANGE THIS WHEN UPDATING TO NEW DATA STRUCTURE.
        userRef.child(listName).child(itemRank).setWithPriority({
            title: title,
            artist: artist,
            img: img
        }, itemRank);
    });
    //**CHANGE WHEN UPDATING TO NEW DATA STRUCTURE. THERE WILL BE NO DELETING OF OLD LISTS, ONLY OVERWRITING.
    if (listName != loadedList && loadedList != -1) { //If the saved name differs from the most recently loaded list. (If the name was changed).
        //delete the data at userRef.child(loadedList)
        console.log('Name has changed. Previously lodaded list will be deleted.');
        userRef.child(loadedList).remove( function() {
            console.log('Old list was deleted.');
            loadedList = listName;
            console.log("loadedList = " + loadedList);
        });
    }
}
var updateListName = function(listNameEdit) {
    listNameEdit.hide();
    if (listNameEdit.val().trim() == "") { //Filler text if there is nothing entered.
        $('.list-name').text("My Top Albums").show();
    } else {
         $('.list-name').text(listNameEdit.val()).show();
    }
    if (myUser != -1) { //If logged in.
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
        saveList($('.list-name').text()); 
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
    console.log('.new-user-list clicked');
    loadedList = -1;
    $('.list-title').text('');
    $('.list-artist').text('');
    $('.list-image').attr('src', "").css('padding-bottom', "0"); 
    $('.list-input').show();
    $('.list-search-button').hide();
    // Close Dropdown 
    $( event.currentTarget ).closest( '.btn-group' ).children( '.dropdown-toggle' ).dropdown( 'toggle' );
    $('.list-name').text('New List').click();

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

//Collapse the navbar because it forgets sometimes :)
$('.navbar-collapse').collapse('hide');