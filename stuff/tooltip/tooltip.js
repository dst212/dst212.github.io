// made by dst212

/*
 * This script is needed in order to make possible to users to pin every tooltip by clicking on it
 * It enables a void link (javascript:void(0)) on every single tooltip, so you can use this script
 * along with https://dst212.github.io/stuff/tooltips.css in order to get tooltips available to
 * your website.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

function init_tooltips() {
	var tt=document.getElementsByClassName('tooltip');
	var i, j, newtitle, tooltip;
	for(i = 0, j = 0; i < tt.length; i++) {
		if(!tt[i].done) {
			tt[i].href = 'javascript:void(0);';
			tt[i].getElementsByClassName('item')[0].href = 'javascript:void(0);';
			newtitle =
				'<span style="display:block;text-align:center;">' +
					(tt[i].title == '' ? 'Tooltip: <i>' + tt[i].getElementsByClassName('item')[0].innerHTML + '</i>' : '<b>' + tt[i].title + '</b>') +
				'</span><br/>';
			tooltip = tt[i].getElementsByClassName('content')[0];
			tooltip.innerHTML = newtitle + tooltip.innerHTML;
			tt[i].done = true;
			j++;
		}
	}
	if(j) console.log('Initialized ' + j + ' new tooltip' + (j != 1 ? 's.' : '.'));
}

//END
