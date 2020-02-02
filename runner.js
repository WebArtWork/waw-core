/*
*	Create new project
*/
const new_project = function(params) {
	console.log('Create new project', params);
	process.exit(1);
};
module.exports.new = new_project;
module.exports.n = new_project;
/*
*	Create new part
*/
const add = function(params) {
	console.log('Create new part', params);
	process.exit(1);
};
module.exports.add = add;
module.exports.a = add;
/*
*	Version Management
*/
const version = function(params){
	console.log('waw: 1.0.0', params);
	process.exit(1);
}
module.exports['--version'] = version;
module.exports['-v'] = version;
module.exports['version'] = version;
module.exports['v'] = version;
