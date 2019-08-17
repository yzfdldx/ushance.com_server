
// const webHashFn = (key) => { // 获取对应的hash值
//   let result = '';
//   const Hash = window.location.hash.split('#/')[1];
//   if (Hash) {
//     const Hash2 = Hash.split('?');
//     if (Hash2[0]) {
//       const webData = Hash2[0].split('/');
//       if (webData[key]) {
//         result = webData[key];
//       }
//     }
//   }
//   return result;
// }

// const deepCopy = (source) => { // 对象拷贝
//   let result;
//   if (source.constructor === Array) {
//     result = [];
//     for (const key in source) {
//       result[key] = typeof source[key] === 'object' ? DeepCopy(source[key]) : source[key];
//     }
//   } else {
//     result = {};
//     for (const jsonkey in source) {
//       result[jsonkey] = typeof source[jsonkey] === 'object' ? DeepCopy(source[jsonkey]) : source[jsonkey];
//     }
//   }
//   return result;
// }

const getCookie = (name) => { // 获取cookie
  let start;
  let end;
  if (document.cookie.length>0) {
    start = document.cookie.indexOf(`${name}=`); // name + "="
    if (start!=-1) {
      start=start + name.length+1
      end=document.cookie.indexOf(";",start)
      if (end==-1) end=document.cookie.length
      return unescape(document.cookie.substring(start,end))
    }
  }
  return ""
}

const setCookie = (name,value,expiredays) => { // 设置cookie
  let exdate=new Date()
  exdate.setDate(exdate.getDate()+expiredays)
  document.cookie = name + "=" + escape(value) + ((expiredays==null) ? "" : ";expires=" + exdate.toGMTString())
}


const strToJson = (str) => { // dd=12&sss=343434?ca => {dd:12,sss:343434}
  if (!str) return {}
  const Idname = str.split('?')[0];
  const nowWwwData = Idname.split('&');
  const outData = {};
  if (nowWwwData.length > 1) {
    nowWwwData.map((item) => {
      const nowData = item.split('=');
      const key = nowData[0];
      const value = nowData[1];
      outData[key] = value;
      return null
    })
  }
  return outData
}

const shuziFn = (num) => {
  if (!/^\d*(\.\d*)?$/.test(num)) { alert("Number is wrong!"); return "Number is wrong!"; }
  let AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
  let BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
  let a = ("" + num).replace(/(^0*)/g, "").split("."), k = 0, re = "";
  for (let i = a[0].length - 1; i >= 0; i--) {
  switch (k) {
  case 0: re = BB[7] + re; break;
  case 4: if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
  re = BB[4] + re; break;
  case 8: re = BB[5] + re; BB[7] = BB[5]; k = 0; break;
  }
  if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0) re = AA[0] + re;
  if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re; k++;
  }
  if (a.length > 1) { //加上小数部分(如果有小数部分)
    re += BB[6];
    for (let i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
  }
  return re;
}




const webHashFn = (key) => { // 对象拷贝
  let result = '';
  const Hash = window.location.hash.split('#/')[1];
  if (Hash) {
    const Hash2 = Hash.split('?');
    if (Hash2[0]) {
      const webData = Hash2[0].split('/');
      if (webData[key]) {
        result = webData[key];
      }
    }
  }
  return result;
}






const deepCopy = (source) => { // 对象拷贝
  let result;
  if (source.constructor === Array) {
    result = [];
    for (const key in source) {
      result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
    }
  } else {
    result = {};
    for (const jsonkey in source) {
      result[jsonkey] = typeof source[jsonkey] === 'object' ? deepCopy(source[jsonkey]) : source[jsonkey];
    }
  }
  return result;
}

export default {
  DeepCopy: deepCopy,
  WebHashFn: webHashFn,
  GetCookie: getCookie,
  SetCookie: setCookie,
  StrToJson: strToJson,
  ShuziFn: shuziFn,
}

// export default {
//   DeepCopy: DeepCopy,
//   WebHashFn: webHashFn
// }
