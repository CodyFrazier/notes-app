const API = 'https://acme-users-api-rev.herokuapp.com/api';
let user, notes;
const fetchUser = async ()=> {
	const storage = window.localStorage;
    const userId = storage.getItem('userId'); 
    if(userId){
		try {
			return (await axios.get(`${API}/users/detail/${userId}`)).data;
		}catch(ex){
			storage.removeItem('userId');
			return fetchUser();
		}
	}
    const user = (await axios.get(`${API}/users/random`)).data;
    storage.setItem('userId', user.id);
    return  user;
};

const startApp = async() => {
	//userBox, savedNotes
	user = await fetchUser();
	renderUser();
	const response = await axios.get(`${API}/users/${user.id}/notes`);
	notes = response.data;
	console.log(notes);
	renderNotes();
	setNoteEars();
}
const renderUser = () => {
	document.querySelector('#userBox').innerHTML = `
	<h3 id = 'userName'>${ user.fullName }</h3>
	<div id = 'infoRow' class = 'rowWrap flexCenterA'>
	<div id = 'avatar'><img src = ${ user.avatar }></div>
	<div id = 'userData' class = 'columnWrap'>
	<div id = 'bio' class = 'columnWrap'>
	<h4>Bio:</h4>
	<span>${ user.bio }</span>
	</div>
	</div>
	</div>
	`;
}

const renderNotes = () => {
	const html = notes.map( (note, idx) => {
		return `
		<li class = 'rowNW flexCenterJ'>
		<span class = 'displayNote' value = ${ idx }>${ note.text }</span>
		<input type = 'button' class = 'noteDel' data-index = ${ idx } value = 'x'>
		</li>
		`;
	});
	
	document.querySelector('#savedNotes').innerHTML = `
	<h2>Notes ( ${ notes.length } )</h2><ul>${ html.join('') }</ul>
	`;
}

document.querySelector('#addNote').addEventListener('click', ({ target }) => {
	event.preventDefault();
	const note = document.querySelector('textarea').value;
	document.querySelector('textarea').value = '';
	if(note && notes.length < 5){
		notes.push({archived : false, text : note, userId : user.id });
		renderNotes();
		setNoteEars();
	}else if(notes.length === 5){
		//build an overlay that alerts the user to this fact. Dismiss after interval of 5s.
		//give x to dismiss as well.
		document.querySelector('#overlay').style.display = 'flex';
		document.querySelector('#alertCard').innerHTML = `
		<p id = 'alertContent'>
			You Can't Post Any More Notes Right Now!
		</p>
		`;
		console.log("You can't post any more notes right now!");
	}else if(!notes){
		//use the same overlay as above, but alert this instead.
		console.log("You didn't type anything!");
	}
});

const setNoteEars = () => {
	document.querySelectorAll('.displayNote').forEach( displayed => {
		displayed.addEventListener('click', ({ target }) => {
			notes[displayed.getAttribute('value')].archived = true;
			console.log('Still Needs to actually be "archived" though'); //TODO item
		});
	});
	
	document.querySelectorAll('.noteDel').forEach(button => {
		button.addEventListener('click', ({ target }) => {
			const toDelete = target.parentNode.querySelector('.displayNote');
			notes = notes.filter((note, idx) => {
				return idx !== Number(toDelete.getAttribute('value'));
			});
			renderNotes();
			setNoteEars();
		});
	});
}

window.addEventListener('resize', ({ target }) => {
	if(window.outerWidth > 414){
		document.querySelector('#container').classList = 'rowWrap flexAroundJ';
	}else{
		document.querySelector('#container').classList = 'columnNW flexAroundA';
	}
	console.log(document.querySelector('#container').classList);
	console.log(window.outerWidth);
});

startApp();
