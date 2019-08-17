
exports.dom = (data, dom, fn) => { // link-href返回值
	var str= data;
	var Dom = dom;
	var attrData = [];
	var HtmlData = [];
	
	var strOnoff = [];
	strOnoff = str.split('<\/' + Dom + '>');
	if (strOnoff.length !== 1) { // 闭合节点
		for (var i in strOnoff) {
			if (strOnoff[i] !== '') { // 真正的节点
				var Html1;
				Html1 = strOnoff[i].split('>');
				if (Html1[Html1.length - 1]) {
					HtmlData.push( Html1[Html1.length - 1] );
				} else {
					HtmlData.push( null );
				}
				var attr1;
				var attr2;
				var attrCss = [];
				attr1 = Html1[Html1.length - 2].split('<' + Dom );
//				attr2 = attr1[1].split(' ');
				if (attr1.length === 1) {
					attrData.push(null);
				} else {
					attr2 = attr1[1].split(' ');
					for (var j in attr2){
						var attr3;
						var attr4;
						var attr5;
						var attrAll;
						if (attr2[j]) {
							attr3 = attr2[j].split('=');
							if (attr3[1]) {
								attr4 = attr3[1].split('"');
								attr5 = attr3[1].split("'");
								if (attr4.length !== 1) {
									attrAll = {
										name: attr3[0],
										value: attr4[1]
									}
								} else {
									attrAll = {
										name: attr3[0],
										value: attr5[1]
									}
								}
								attrCss.push(attrAll);
							}
						}
					}
					attrData.push(attrCss);
				}
			}
		}
	} else { // 单节点
		var link1 = str.split('/>');
		for (var i in link1) {
			var link2;
			var attrCss = [];
			link2 = link1[i].split( '<' + Dom );
			if ( link2[1] === '' ) {
				attrData.push(null);
			}
			if (link2[1]) {
				attr2 = link2[1].split(' ');
				for (var j in attr2){
					var attr3;
					var attr4;
					var attr5;
					var attrAll;
					if (attr2[j]) {
						attr3 = attr2[j].split('=');
						if (attr3[1]) {
							attr4 = attr3[1].split('"');
							attr5 = attr3[1].split("'");
							if (attr4.length !== 1) {
								attrAll = {
									name: attr3[0],
									value: attr4[1]
								}
							} else {
								attrAll = {
									name: attr3[0],
									value: attr5[1]
								}
							}
							attrCss.push(attrAll);
						}
					}
				}
				attrData.push(attrCss);
			}
		}
	}
	fn(attrData,HtmlData);
}


