import Dom from "/api/wjst/dom";
class Spinner {
  	show(message, timeout = 2000) {
		const template = Dom.template('alert', { message });
		
		if (template && Dom.exists('alert')) {
			Dom.replace('alert', template);
			
			setTimeout(() => {
				Dom.clear('alert');
			}, timeout);
		} else {
			alert(message)
		}
	}

}
export default new Spinner();
