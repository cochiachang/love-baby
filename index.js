var linebot = require('linebot');
var express = require('express');
const config = require('./config');
const { Client } = require('pg');

const client = new Client({
  connectionString: config.DATABASE_URL,
  ssl: true,
});

client.connect();

function queryDatabase(user, name, pic) {
	let querystring = "INSERT INTO member VALUES ('"+user+"', '"+name+"', '"+pic+"');";
	console.log(querystring)
		client.query(querystring, (err, res) => {
			if (err) throw err;

			client.end();
		});
}
var bot = linebot({
  channelId: config.channelId,
  channelSecret: config.channelSecret,
  channelAccessToken: config.channelAccessToken
});
bot.on('follow',   function (event) { 
	event.reply("您好~!謝謝你加我為好友!");
});
bot.on('join',   function (event) { 
	event.reply("大家好~我是小佳~!");
});
bot.on('message', function(event) {
  console.log(event); //把收到訊息的 event 印出來看看
  if (event.message.type == 'text'){
	var msg = event.message.text;
	if(msg.indexOf("你") >= 0 && msg.indexOf("滾") >= 0){
		console.log(event.source.groupId);
		event.reply("好的~!我馬上離開~^__^!");
		setTimeout(()=>{bot.leaveGroup(event.source.groupId)},1000);
	}else{
		event.source.profile().then(function (profile) {
		  console.log(profile);
		  //event.reply(profile.displayName + "說了["+msg+"]");
		  event.reply({
			  type: 'image',
			  originalContentUrl: profile.pictureUrl,
			  previewImageUrl: profile.pictureUrl
			});

			queryDatabase(event.source.userId, profile.displayName, profile.pictureUrl);
		});
	}
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});