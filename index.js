const { exec } = require('child_process');
const fs = require('fs');
module.exports = function(waw){
	waw.parallel = function(arr, callback){
		let counter = arr.length;
		if(counter===0) return callback();
		for (let i = 0; i < arr.length; i++) {
			arr[i](function(){
				if(--counter===0) callback();
			});
		}
	}
	const serial = function(i, arr, callback){
		if(i>=arr.length) return callback();
		arr[i](function(){
			serial(++i, arr, callback);
		});
	}
	waw.serial = (arr, callback) => serial(0, arr, callback);
	waw.each = function(arrOrObj, func, callback, isSerial=false){
		if(typeof callback == 'boolean'){
			isSerial = callback;
			callback = ()=>{};
		}
		if(Array.isArray(arrOrObj)){
			let counter = arrOrObj.length;
			if(counter===0) return callback();
			if(isSerial){
				let serialArr = [];
				for (let i = 0; i < arrOrObj.length; i++) {
					serialArr.push(function(next){
						func(arrOrObj[i], function(){
							if(--counter===0) callback();
							else next();
						});
					});
				}
				serial(0, serialArr, callback);
			}else{
				for (let i = 0; i < arrOrObj.length; i++) {
					func(arrOrObj[i], function(){
						if(--counter===0) callback();
					});
				}
			}
		}else if(typeof arrOrObj == 'object'){
			if(isSerial){
				let serialArr = [];
				let arr = [];
				for(let each in arrOrObj){
					arr.push({
						value: arrOrObj[each],
						each: each
					});
				}
				let counter = arr.length;
				for (let i = 0; i < arr.length; i++) {
					serialArr.push(function(next){
						func(arr[i].each, arr[i].value, function(){
							if(--counter===0) callback();
							else next();
						});
					});
				}
				serial(0, serialArr, callback);
			}else{
				let counter = 1;
				for(let each in arrOrObj){
					counter++;
					func(each, arrOrObj[each], function(){
						if(--counter===0) callback();
					});
				}
				if(--counter===0) callback();
			}
		}else callback();
	}
	waw.dataUrlToLocation = function(dataUrl, loc, file, cb){
		var base64Data = dataUrl.replace(/^data:image\/png;base64,/, '').replace(/^data:image\/jpeg;base64,/, '');
		var decodeData = Buffer.from(base64Data, 'base64');
		fs.mkdirSync(loc, { recursive: true });
		fs.writeFile(loc+'/'+file, decodeData, cb);
	}
	waw.exe = function(command, cb=()=>{}){
		if(!command) return cb();
		exec(command, (err, stdout, stderr) => {
			cb({err, stdout, stderr});
		});
	}
	let events = {};
	waw.on = function(event, cb){
		if(!events[event]) events[event]=[];
		if(typeof cb == 'function') events[event].push(cb);
	}
	waw.emit = function(event, info){
		if(!events[event]) events[event]=[];
		for (var i = 0; i < events[event].length; i++) {
			events[event][i](info);
		}
	}
}
