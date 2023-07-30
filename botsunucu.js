var resultstr = ' ';
var resultnumber = 0;
var peoplearr = [];
var isforward = true;
var resultjson = {time:10, data:[]};
var token;
var blacklist = [];
var managed;
const giventoken = JSON.parse('{"token":"123456789:QWERTY_asdfgh","groupid":-1234567890123,"blacklist":[]}');
4

const date = new Date();

function firstFunction() {
	const options = {method: 'POST', headers: {accept: 'application/json'}};
	console.log(typeof giventoken)
	token = 'https://api.telegram.org/bot' + giventoken.token;
	managed = giventoken.groupid;
	blacklist = giventoken.blacklist;

	fetch(token+'/getUpdates', options)
		.then((response)=>response.json())
		.then((response) => myFunction(response))
		.catch(err => console.error(err));
}
function sender(value) {
	try {
		 
		let textmes = value.message.text;
		if (typeof textmes  == 'undefined'){
		textmes = '';
		}
		let messageid = value.message.message_id;
		messageid = messageid.toString();
		let updateid = value.update_id;
		let chatid = value.message.chat.id;
		let typechat = value.message.chat.type;
		
		if (blacklist.includes(chatid)){
			console.log("Karalistede"+chatid)
		} else if (chatid == managed && textmes.startsWith("/affet")){
			let banlist = blacklist.join("%20");
			fetch(token+'/sendmessage?&chat_id='+managed+'&text='+banlist)
			blacklist = [];
		} else if (chatid == managed && textmes.startsWith("/engelle")){
			let prodest_id = textmes.split(' ');
			try{let banlist = prodest_id.slice(1);
				blacklist = blacklist.concat(banlist);
				blacklist.sort()
				console.log(banlist)
			}catch{
				console.log(prodest_id)
			}
			let forlist = blacklist.join("%20");
			fetch(token+'/sendmessage?&chat_id='+managed+'&text='+forlist)
		} else if (chatid == managed && textmes.startsWith("/engelliste")){
			let banlist = blacklist.join("%20");
			fetch(token+'/sendmessage?&chat_id='+managed+'&text='+banlist)
		} else if (chatid == managed && textmes.startsWith("/cevapla")){
			let prodest_id = textmes.split(' ');
			let replying = value.message.reply_to_message.message_id;
			let dest_id = prodest_id[1];
			try{let destmsg_id = prodest_id[2];
				console.log(destmsg_id)
				resultjson.data.push(value)
				resultstr += '\n' + chatid+' '+messageid;
				resultnumber += 1;
				fetch(token+'/copymessage?chat_id='+dest_id+'&from_chat_id='+managed+'&message_id='+replying+'&reply_to_message_id='+destmsg_id);
			}catch{
				console.log(prodest_id)
				resultjson.data.push(value)
			    resultstr += '\n' + chatid+' '+messageid;
			    resultnumber += 1;
				fetch(token+'/copymessage?chat_id='+dest_id+'&from_chat_id='+managed+'&message_id='+replying)
			}
		} else if (chatid == managed && textmes.startsWith("/indir")){
			let prodest_id = textmes.split(' ');
			let arrival_id = prodest_id[1];
			let arrvmsg_id = prodest_id[2];
			fetch(token+'/forwardmessage?&chat_id='+managed+'&from_chat_id='+arrival_id+'&message_id='+arrvmsg_id);
		} else if (chatid == managed && textmes.startsWith("/forwardon")){
			isforward = true;
		} else if (chatid == managed && textmes.startsWith("/forwardoff")){
			isforward = false;
		} else if (typechat == "supergroup" || typechat == "group"){
			if(textmes.startsWith("/yolla")){
			console.log('Gruptan');
			if(isforward){
			fetch(token+'/forwardmessage?chat_id='+managed+'&from_chat_id='+chatid+'&message_id='+messageid);
			}
			resultjson.data.push(value)
			resultstr += '%0A' + chatid+' '+messageid;
			resultnumber += 1;
			fetch(token+'/sendmessage?chat_id='+chatid+'&reply_to_message_id='+messageid+'&text=Mesaj%C4%B1n%C4%B1z+al%C4%B1nm%C4%B1%C5%9Ft%C4%B1r.%0D%0ATe%C5%9Fekk%C3%BCr+ederiz.');
			}
		} else if (typechat="private"){
			console.log('Sahistan')
			if (textmes.startsWith("/start")){
				fetch(token+'/sendmessage?chat_id='+chatid+'&text=Ho%C5%9Fgeldiniz.%20Y%C3%B6netimine%20buradan%20mesaj%20yazarak%20ula%C5%9Fabilirsiniz.');
				resultstr += '\n' + chatid+' '+messageid;
				resultjson.data.push(value)
				resultnumber += 1
			} else {
				if(isforward){
				fetch(token+'/forwardmessage?chat_id='+managed+'&from_chat_id='+chatid+'&message_id='+messageid);
				}
				resultstr += '\n' + chatid+' '+messageid;
				resultnumber += 1;
				resultjson.data.push(value)
				if(peoplearr.indexOf(chatid) == -1){
					fetch(token+'/sendmessage?chat_id='+chatid+'&text=Mesaj%C4%B1n%C4%B1z+al%C4%B1nm%C4%B1%C5%9Ft%C4%B1r.%0D%0ATe%C5%9Fekk%C3%BCr+ederiz.');
					peoplearr.push(chatid)
			    }
			} 
		}
	} catch {
		console.log('Error1');
	}
};
function myFunction(telejson) {
	try {
		var date = new Date();
		var zam = date.getTime();
		resultjson.time=zam;
		console.log('obj:');
		console.log(telejson);
		var obj = telejson.result;
		resultstr = 'Gelen mesajlar:';
		obj.forEach(sender);
		let resjson = JSON.stringify(resultjson);
		if (resultnumber != 0){
		var blob = new Blob([resjson], { type: 'plain/text'});
		

		var formData = new FormData();
		formData.append('chat_id', managed);
		formData.append('document', blob, 'Kütük'+zam+'.json');
		formData.append('caption', resultstr);
		}
		fetch(token+'/sendDocument', { method: "POST", body: formData });
		
		resultnumber = 0;
		peoplearr = [];
		resultjson = {time: 1, data:[]};
	} catch {
		console.log('Error3');
	}
	
	
	try {
	  let last_update = obj[obj.length -1].update_id;
	  let las = parseInt(last_update);
	  las = las +1;
	  last_update = las.toString();
	  console.log(last_update);
	  fetch(token+'/getUpdates?offset='+last_update);
	} catch {
		console.log('Error2');
	}
};
//const giventoken = process.argv[2];
//console.log(typeof giventoken)
firstFunction();
setInterval(firstFunction,60000);