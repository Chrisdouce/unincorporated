export let baseUrl = 'http://localhost:3000'; 
if(!window.location.href.startsWith('http://localhost:3000')){
    baseUrl = ''
}