class Alert{ 
show(message){ 
  const template = Dom.template('alert', {message});
  if 
    (template && Dom.exists('alert')) { Dom.replace('alert', template) } 
  else 
  { alert(message) }
   }
}
export default new Alert();
