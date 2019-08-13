const axios = require('axios');
const config = require('./config.json');

const { privateWord, secondsToGive, pointsToGain, searchByGame, channels : configChannels, secondsPoollingTime} = config.settings;
const { twitch, thisApp } = config.tokens;
const { api: apiUrl } = config.urls;

channels = "";
configChannels.forEach(res => channels += `${res},`);

channels = channels.substr(0,(channels.length - 1));

var arrCh = [];
var request = () => setInterval(() => {
    axios.get(`https://api.twitch.tv/kraken/streams?channel=${channels}`, { headers: { 'Client-ID': twitch } }).then(res => {   
    if(res.data.streams.length > 0)
        res.data.streams.map(o => {
            
            arrCh.forEach((res, index) => {
                let exists = res.data.streams.findIndex(r => r.channel.name == res.name);
                if(exists == -1) arrCh.splice(index);                
            });

             if(o.game.toLowerCase() == searchByGame.toLowerCase() &&
              o.stream_type == 'live' &&
               o.channel.status.indexOf(privateWord) >= 1){
                   
                var index = arrCh.findIndex(r => r.name == o.channel.name);
                
                if(index == -1){
                    arrCh.push({
                        name : o.channel.name,
                        time: 0
                    });
                }else{

                    if(arrCh[index].time == secondsToGive) {
                        arrCh[index].added = pointsToGain;
                        axios.post(apiUrl, arrCh[index], {
                            headers: { Authorization: thisApp }
                        }).then(res => {
                            console.log(`Channel ${arrCh[index].name} gain ${pointsToGain} points.`); 
                            arrCh.splice(index);
                        }).catch(err => console.log(err));


                    }else if(arrCh[index].time > config.secondsToGive){
                        arrCh.splice(index);                        
                    }else{
                        arrCh[index].time+=secondsPoollingTime;
                    }
                }
            }

        });
    }).catch(err => console.log(err));

}, secondsPoollingTime*1000)

request();