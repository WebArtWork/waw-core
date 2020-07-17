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
	waw.files = function(opts){
		waw.app.post("/api/"+opts.part+"/avatar", opts.ensure || waw.role('admin'), function(req, res) {
			opts.schema.findOne(opts.query || {
				_id: req.body._id
			}, function(err, doc) {
				if(err || !doc) return res.send(false);
				doc.thumb = '/api/'+opts.part+'/avatar/' + doc._id + '.jpg?' + Date.now();
				waw.parallel([function(n) {
					doc.save(n);
				}, function(n) {
					waw.dataUrlToLocation(req.body.dataUrl, opts.dirname, doc._id + '.jpg', n);
				}], function() {
					res.json(doc.thumb);
				});
			});
		});
		waw.app.post("/api/"+opts.part+"/avatars", opts.ensure || waw.role('admin'), function(req, res) {
			let custom = waw._mongoose.Types.ObjectId();
			let url = '/api/'+opts.part+'/avatar/' + custom + '.jpg?' + Date.now();
			waw.parallel([function(done) {
				opts.schema.update(opts.query || { _id: req.body._id }, { $push: { thumbs: url } }, done);
			}, function(n) {
				waw.dataUrlToLocation(req.body.dataUrl, opts.dirname, custom + '.jpg', n);
			}], function() {
				res.json(url);
			});
		});
		waw.app.get("/api/"+opts.part+"/avatar/:file", function(req, res) {
			res.sendFile(opts.dirname + req.params.file);
		});
	}
	waw.ensure_files = function(extra){
		return function(req, res, next){
			if(req.body.thumb){
				if(!req.body._id) req.body._id = mongoose.Types.ObjectId();
				let dataUrl = req.body.thumb;
				req.body.thumb = '/api/product/avatar/' + req.body._id + '.jpg?' + Date.now();
				waw.dataUrlToLocation(dataUrl, __dirname+'/files/', req.body._id + '.jpg', ()=>{
					if(extra) extra(req, res, next);
					else next();
				});
			}else{
				if(extra) extra(req, res, next);
				else next();
			}
		}
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
