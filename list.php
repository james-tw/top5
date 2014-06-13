<?php 
	$list_user = $_GET['u'];
	$list_id = $_GET['id'];
?>

<html>
  <head>
    <title>top5</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <link href="css/bootstrap.css" rel="stylesheet">
    <link href="css/bootflat.css" rel="stylesheet">
    <link href="css/top5.css" rel="stylesheet" media="screen">
</head>
<body>
	<div class="modal fade" id="modal-about" style="display: none;" aria-hidden="true">
	    <div class="modal-dialog modal-xs">
	        <div class="modal-content">
	            <div class="modal-header">
	                <button class="close" data-dismiss="modal" type="button">&times;</button>
	                <h4 class="modal-title">About top5</h4>
	            </div>
	            <div class="modal-body">
	                <div>
	                	<p>top5 was developed entirely by <a href="http://www.jamestw.net">James TW</a> using Twitter Bootstrap 3 and the Bootflat theme. Database and login functionality are made possible by <a href="http://www.firebase.com">Firebase</a>. Album database API provided by <a href="http://www.last.fm">last.fm</a>.</p>
	                	<p>You can contact me by <a href="mailto:meroin@gmail.com">email</a> or see my <a href="http://www.twitter.com/james_tw">Twitter</a>, <a href="http://www.linkedin.com/pub/james-tettelbach-whitehouse/91/b05/9b2">LinkedIn</a>, or <a href="https://github.com/james-tw">GitHub</a> pages.</p>
	                </div>
	            </div>
	            <div class="modal-footer">
	                <button class="btn btn-default" data-dismiss="modal" type="button">Close</button>
	            </div>
	        </div>
	    </div>
	</div>
	<div class="navbar navbar-inverse">
        <div class="container">
        	<div class="navbar-header">
              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="/top5">top5</a>
            </div>
            <div class="collapse navbar-collapse" id="navbar-collapse-7">
	        	<ul class="nav navbar-nav navbar-right">
	              <li><a href="#modal-about" data-toggle="modal">About</a></li>
	            </ul>
            </div>
        </div>
	</div>

	<div class="list-container container clearfix">
		<div class="row">		
			<div class="list-header col-md-8 col-md-offset-2">
				<h2 class="list-name">My Top Albums</h2><input class="list-name-edit input-lg" type="text" maxLength="40">
			</div>
		</div>
		<div class="row main-content">
          	<div class="col-md-8 col-md-offset-2">
	            <div id="album-list" class="list-group">
	              	<a id="list-item-1" class="list-group-item"><div class="row">
		              	<div class="col-xs-3 list-thumbnail"><img class="list-image img-rounded img-responsive" src="" alt=""></div>
						<div class="col-xs-8">
		                	<h1 class="list-title list-group-item-heading"></h1>
		                	<p class="list-artist list-group-item-text"></p>
		                	<div class="list-links"></div>
		                </div>         	
	               	</div></a>
					<a id="list-item-2" class="list-group-item"><div class="row">
		              	<div class="col-xs-3 list-thumbnail"><img class="list-image img-rounded img-responsive" src="" alt=""></div>
						<div class="col-xs-8">
		                	<h1 class="list-title list-group-item-heading"></h1>
		                	<p class="list-artist list-group-item-text"></p>
		                	<div class="list-links"></div>
		                </div> 
	               	</div></a>
					<a id="list-item-3" class="list-group-item"><div class="row">
		              	<div class="col-xs-3 list-thumbnail"><div class="list-image-container"><img class="list-image img-rounded img-responsive" src="" alt=""></div></div>
						<div class="col-xs-8">
		                	<h1 class="list-title list-group-item-heading"></h1>
		                	<p class="list-artist list-group-item-text"></p>
		                	<div class="list-links"></div>
		                </div> 
	               	</div></a>
					<a id="list-item-4" class="list-group-item"><div class="row">
		              	<div class="col-xs-3 list-thumbnail"><div class="list-image-container"><img class="list-image img-rounded img-responsive" src="" alt=""></div></div>
						<div class="col-xs-8">
		                	<h1 class="list-title list-group-item-heading"></h1>
		                	<p class="list-artist list-group-item-text"></p>
		                	<div class="list-links"></div>
		                </div>
	               	</div></a>
					<a id="list-item-5" class="list-group-item"><div class="row">
		              	<div class="col-xs-3 list-thumbnail"><div class="list-image-container"><img class="list-image img-rounded img-responsive" src="" alt=""></div></div>
						<div class="col-xs-8">
		                	<h1 class="list-title list-group-item-heading"></h1>
		                	<p class="list-artist list-group-item-text"></p>
		                	<div class="list-links"></div>
		                </div> 
	               	</div></a>

	            </div>
          	</div>
        </div>
	</div>


    <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="https://cdn.firebase.com/v0/firebase.js"></script>
    <script src="https://cdn.firebase.com/v0/firebase-auth-client.js"></script>
    <script src="js/lastfm.api.js"></script>
    <script src="js/lastfm.api.md5.js"></script>
    <script>
    	$(document).ready(function(){
	    	$('.list-container').hide();
			var loadList = function(listName) {
			    console.log("attempting to load list.");
			    loadRef = new Firebase("https://second-login-appy.firebaseio.com/users/" + "<?php echo $list_user; ?>" + "/lists/" + "<?php echo $list_id; ?>"); 
			    loadRef.on('child_added', function(childSnapshot) {
			        //For each number 1-5, find the list-item box and fill it with the data from the list.
			        var itemNum = $('#list-item-' + childSnapshot.name());
			        itemNum.find('.list-image').attr('src', childSnapshot.val().img);
			        itemNum.find('.list-title').text(childSnapshot.val().title);
			        itemNum.find('.list-artist').text(childSnapshot.val().artist);
			    });
			    //Update the list name HTML with the one stored on the server.
			    loadRef.once('value', function(childSnapshot) {
			        $('.list-name').text(childSnapshot.child('listName').val());
			    })
			    $('.list-container').show();
			}();
		});
    </script>
</body>