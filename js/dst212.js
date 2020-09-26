// made by dst212

/*
 * This script adds some nice functions to make it easier for me to write other scripts.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

/*function setOnscroll(){
	var doc=document.documentElement.style;
	var bodySec=document.getElementById("body");
	body.onscroll=function(){
		if(bodySec.scrollTop>0) doc.setProperty("--title-height","var(--title-height-final)");
		else doc.setProperty("--title-height","var(--title-height-initial)");
	};
}*/

function addFunction(f,t){	//concatenate functions
	return t ? (f ? () => {f(); t();} : t) : (f ? f : () => {});
}

//END
