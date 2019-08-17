var Dev = document.getElementsByClassName('ie-fix');
var P = document.getElementsByTagName('p');
var ie = document.getElementsByClassName('ie-fix');
var word = document.getElementsByClassName('reader-word-layer');

var str;
for (var i in word){
	str += word[i].innerHTML;
}

console.log(str);