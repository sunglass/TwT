var sid = "ACALm0i9ZAmLHa";
var token = "XCDpldWbbM0d9kmJ";
var b64 = function() {return"Basic " +  encode(sid + ":" + token);}
var baseurl = "https://sunglass.io"

jQuery.support.cors = true;

function populate(){//this is the main function called from document.ready
	$("#mainContentWrapper").empty();
	var url = baseurl + "/api/v1/projects";
	fireAjax(url, placeInfo);
}

function placeInfo(userData){ //this formats the data for each project and places in the div; formatting should happen here
	//console.log(userData);
	var publicProjects = false;
	
	//userName
	var userURL = baseurl + "/api/v1/users";
	fireAjax(userURL, function(userData){
	//console.log(userData.name);
	$("#currentUser").html(userData.name);
});
	
	//step through the different roles... ie: admin, owner etc...
	$.each(userData, function(){
		var role=this;
		//step through the projects within each role
		$.each(role, function(){
			var project=this;

			if(project.visibility == "PUBLIC"){
				publicProjects = true;
				
				//make project Div
				var $newDiv = $('<a class="projectDiv"/>');
				$("#mainContentWrapper").append($newDiv);
				
				//fill $newDiv with data divs -----------------------------------------------------------------------
				
				//project image
				var projectImageURL = baseurl + "/api/v1/projects/" + project.id +"/cover"; 
				$newDiv.append('<div class="imageDiv" ><img class="projectImage" src="'+projectImageURL+'"></div>');	
				
				//title and link
				$newDiv.append('<p class="projectTitle">'+ project.name +'</p>'); 
				var $projectLink=$('<div/>');
				$newDiv.append($projectLink);
				
				//project id
				$newDiv.append('<p><a class="projectTextBold">Project ID:</a> <a class="projectText"> '+ project.id +'</a></p>');

				//description
				$newDiv.append('<p><a class="projectTextBold">Project Description:</a> <a class="projectText" style="text-transform:lowercase;">&quot;'+ project.description +'&quot;</a></p>'); 
				
				//username (filled by ajax call below)
				var $usernameDiv =$('<div/>');
				$newDiv.append($usernameDiv);
				
				//visibility
				$newDiv.append('<p><a class="projectTextBold">Visibility: </a><a class="projectText" style="text-transform:lowercase;">'+ project.visibility +'</a></p>');
				
				//dates
				$newDiv.append('<p><a class="projectTextBold">Created: </a><a class="projectText">'+ prettyDate(project.createdAt) +'</a></p>');
				$newDiv.append('<p><a class="projectTextBold">Modified: </a><a class="projectText"> ' + prettyDate(project.modifiedAt) +'</a></p>');
				
				//#Project Stats
				var $statsDiv =$('<div />');
				//# of notes
				$statsDiv.append('<p><a class="projectTextBold">Notes: </a><a class="projectText">'+project.assetCounts.notes+'</a></p>');
				//# of spaces
				$statsDiv.append('<p><a class="projectTextBold">Spaces: </a><a class="projectText">'+project.assetCounts.spaces+'</a></p>')
				//# of models
				$statsDiv.append('<p><a class="projectTextBold">Models: </a><a class="projectText">'+project.assetCounts.models+'</a></p>')
				//# of collaborators
				$statsDiv.append('<p><a class="projectTextBold">Collaborators: </a><a class="projectText">'+project.assetCounts.collaborators+'</a></p>');
				$newDiv.append($statsDiv);

				//Project Notes (filled by ajax call below)
				var $notesDiv =$('<div />');
				if (project.assetCounts.notes > 0){
					$notesDiv.append('<br> <p class="projectTitle">Notes:</p>');
					$newDiv.append($notesDiv);
				} 

				//ajax calls to fill divs noted above-----------------------------------------------------------------------

				//project hyperlink
				var rootspaceURL = baseurl + project.links.rootSpace; 
				fireAjax(rootspaceURL, function(spaceData){
					//model for project url "https://184.169.143.149/project/23?spaceId=312cbf73-5c2f-47d6-8ee2-6eee7c055a2a" 
					var projectRootURL = baseurl+'/project/'+project.id+'?spaceId='+spaceData.id;

					//$newDiv.attr("href",projectRootURL); //uncomment this to make the whole div into a link
					$projectLink.append('<p><a class="projectTextBold">Link to Project: </a> <a href="'+projectRootURL+'" target="_blank" class="projectText"> '+projectRootURL+'</a></p>');
				});
				
				//get Notes
				// fist step through spaces (notes are space-specific)...
				var spacesURL = baseurl + "/api/v1/projects/" + project.id +"/spaces";
				fireAjax(spacesURL, function(spacesData){
					
					//...and collect notes for each space.
					$.each(spacesData.spaces, function(){
						var notesURL = spacesURL+"/"+this.id+"/notes";
						fireAjax(notesURL, function(notesData){
							console.log(objectCount(notesData));
							$.each(notesData.notes, function(){
								var noteData = JSON.parse(this.noteData);
								
								//add note items
								$notesDiv.append('<hr>');
								$notesDiv.append('<p><a class="projectTextBold">Title: </a><a class="projectText">'+noteData.title+'</a></p>');
								$notesDiv.append('<p><a class="projectTextBold">By: </a><a class="projectText">'+noteData.author.name+'</a></p>');
								$notesDiv.append('<p><a class="projectTextBold">Date: </a><a class="projectText">'+prettyDate(this.modifiedAt)+'</a></p>');
								//if there's am image...
								if(this.attachments[0]){ $notesDiv.append('<div class="imageDiv"><img class="noteImage" src="https://sunglass.io/portal'+this.attachments[0].content+'"></div>');}
								//note content
								$notesDiv.append('<a class="projectText">'+noteData.description+'</a></p>');
								
								//if note comments
								if(noteData.comments.length > 0){
									var $commentDiv = $('<div />'); 
									for(var i=0 ; i<noteData.comments.length ; i++){
								 		//console.log(noteData.comments[i]);
								 		$commentDiv.append('<br><p class="projectTextBold">comment'+(i+1)+'</p>'); 
								 		$commentDiv.append('<a class="projectText">'+noteData.comments[i].text+'</p>'); 
								 	}
								 	$notesDiv.append( $commentDiv);
								 }
								 
							});//end eachnoteData
						});	//end fireAjax notesURL	
					});//end each spacesData

				});//end fireAjax spaces
				
			}//end if project visibility
		});//end projects
	});//end user roles


	//and if user has no public projects?
	if(!publicProjects) {
		var $newDiv = $('<a class="noProjects"/>');
		var $imageDiv =$('<div class="projectImageContainer" />');
		$imageDiv.append('<img class="projectImage" src="./imgs/sunglass-are-you-ready.jpg">');	//get project image
		$newDiv.append($imageDiv);
		$newDiv.append('<p class="mBold" style="" >No Public Projects Found</p>');
		$newDiv.append('<p class="thin" >Projects must be public to be viewed here</p>');
		$newDiv.append('<p class="thin" >for more information: see <a style="yellow" href="./help.html"> help</a></p>');
		$("#mainContentWrapper").append($newDiv);
		
	}//end no public
	
	$("#mainContentWrapper").append("<div class='bottomBuffer'></div>");
}//end placeInfo


function getModelsJSON(id){
	var url = baseurl + "/api/v1/projects/"+id+"/models";
	//console.log(url);
	data = XHRrequest(url);
	return 	JSON.parse(data).models;//server version
}

function getNotesJSON(spaces){
	//step through all spaces and add notes to array
	var notesArray = Array();
	
	$.each(spaces, function(){
		var url = baseurl + "/api/v1/projects/"+this.projectId+"/spaces/"+this.id+"/notes";
		data = XHRrequest(url);
		data = JSON.parse(data);
		//console.log(data.notes);
		$.each(data.notes, function(){
			//console.log(data.notes);
			notesArray.push(data.notes);
		});
	});
	return notesArray;
}


//API utilities
function encode(txt) {
	if(typeof(btoa) === 'function'){
		//console.log('encoding...');
		return window.btoa(unescape(encodeURIComponent(txt)));
	}else{
		return Base64.encode(txt);
	}
}

function fireAjax(url, callBack){

	var request = $.ajax({
		url : url,
		type : "GET",
		dataType : "json",
		crossDomain: true,
		contentType : "application/json",
		headers : {"Content-Type":"application/json"},
		beforeSend : function(xhr){xhr.setRequestHeader("Authorization", b64()); },
		error:function (xhr, ajaxOptions, thrownError){console.log("Request error: " + xhr.status + " "+thrownError); }    
	});
	
	request.success(callBack);
request.done(function(msg) {/*console.log("request done");*/});
request.fail(function(jqXHR, textStatus) {console.log( "Request failed: "+jqXHR+" "+ textStatus );});
}
var defaultCB = function(data){console.log(JSON.stringify(data));}
//end API utilities 


//basic utilities
function objectCount(object){
	var i = 0;
	for ( var p in object )
	{
		if ( 'function' == typeof this[p] ) continue;
		i++;
	}
	return i;
}

function prettyDate(iso){
	return moment(iso).format("ddd, MM-DD-YY, hh:mm a");
	
}

function auth(login, pass){//get sid and token from email/pass input

	var formData = new FormData();
	formData.append("email",login);
	formData.append("password", pass);

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (event) {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
    	//console.log(xhr.responseText);
    	sid = JSON.parse(xhr.responseText).sid
    	token= JSON.parse(xhr.responseText).token
    	populate(sid,token);
    }
}
};

xhr.open("POST", "https://sunglass.io/api/v1/login");
xhr.send(formData);
}