const utils = {}

utils.isEmpty = (value) => {
  return value === undefined || value === null || value === '';
}

utils.isImage = function(mimetype) {
  return mimetype == 'image/jpeg' || mimetype == 'image/png';
}

utils.isVideo = function(mimetype) {
  return mimetype == 'video/mp4';
}

utils.replaceAll = function(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

utils.cosinesim = function(arrA, arrB) {
  let dot = 0;
  let aSum = 0, bSum = 0;
  let length = arrA.length;

  for (var i = 0; i < length; i++) {
    dot += arrA[i] * arrB[i];
    aSum += arrA[i] * arrA[i];
    bSum += arrB[i] * arrB[i];
  }
  
  return dot / (Math.sqrt(aSum) * Math.sqrt(bSum))
} 

utils.cosinesimRatio = function(arrA, arrB) {
  var dot = 0;
  var aSum = 0, bSum = 0;
  var aTotal = 0, bTotal = 0;
  var length = arrA.length;

  aTotal = arrA.reduce((accumulator, a) => {
    return accumulator + a;
  }, 0);

  bTotal = arrB.reduce((accumulator, a) => {
    return accumulator + a;
  }, 0);

  //console.log(arrA);
  //console.log(aTotal);
  //console.log(bTotal);

  var newArrA = [];
  var newArrB = [];

  for (var i = 0; i < length; i++) {
    var tempA = aTotal === 0 ? (100 / length) : ( (arrA[i] / aTotal) * 100);
    var tempB = bTotal === 0 ? (100 / length) : ( (arrB[i] / bTotal) * 100);

    newArrA.push(tempA);
    newArrB.push(tempB);

    dot += tempA * tempB;
    aSum += tempA * tempA;
    bSum += tempB * tempB;
  }
  
  console.log(newArrA);
  console.log(newArrB);
  
  return dot / (Math.sqrt(aSum) * Math.sqrt(bSum))
} 

utils.cosinesimRatioUsingObject = function(objA, objB) {
  var arrA = [];
  var arrB = [];

  for (var key in objA) {
    arrA.push(objA[key]); // arrA에 objA의 value 저장

    if (key in objB) { // objA에 있는 키 값이 objB에도 함께 있을 때
      arrB.push(objB[key]); // objB에 있는 키에 해당하는 값을 arrB에 추가시켜줌
      delete objB[key]; // abjB에 있는 키 값을 삭제함
    }
    else {
      arrB.push(0); // objA에 있는 키 값이 objB에 없을 경우 0을 넣어줌
    }
  }

  for (var key in objB) { 
    arrB.push(objB[key]); // objB에 있는 key에 해당하는 value를 arrB에 넣어줌
    arrA.push(0);         // objB에 남아있는 key는 arrA에 없으므로 0을 넣어줌
  }

  var dot = 0;
  var aSum = 0, bSum = 0;
  var aTotal = 0, bTotal = 0;
  var length = arrA.length;

  aTotal = arrA.reduce((accumulator, a) => { // arrA에 있는 총합을 구함
    return accumulator + a;
  }, 0);

  bTotal = arrB.reduce((accumulator, a) => { // arrB에 있는 총합을 구함
    return accumulator + a;
  }, 0);

  for (var i = 0; i < length; i++) {
     // 태그 별 비율을 계산. 
     // ex) [1, 9, 0] => [10, 90, 0], [3, 3] => [50, 50], [0, 0] => [50, 50], [0, 1] => [0, 100]
    var tempA = aTotal === 0 ? (100 / length) : ( (arrA[i] / aTotal) * 100);
    var tempB = bTotal === 0 ? (100 / length) : ( (arrB[i] / bTotal) * 100);

    dot += tempA * tempB;
    aSum += tempA * tempA;
    bSum += tempB * tempB;
  }
  
  return dot / (Math.sqrt(aSum) * Math.sqrt(bSum)) // 코사인 유사도 계산
}

utils.cosinesimRatioUsingMap = function(mapA, mapB) {
  var newMapA = new Map(mapA);
  var newMapB = new Map(mapB);

  var arrA = [];
  var arrB = [];

  for (var [key, value] of newMapA) {
    //console.log(key);
    //console.log(value);
    arrA.push(value); // arrA에 objA의 value 저장

    if (newMapB.has(key)) { // objA에 있는 키 값이 objB에도 함께 있을 때
      arrB.push(newMapB.get(key)); // objB에 있는 키에 해당하는 값을 arrB에 추가시켜줌
      newMapB.delete(key); // mapB에 있는 키 값을 삭제함
    }
    else {
      arrB.push(0); // objA에 있는 키 값이 objB에 없을 경우 0을 넣어줌
    }
  }

  for (var [key, value] of newMapB) { 
    arrB.push(value); // objB에 있는 key에 해당하는 value를 arrB에 넣어줌
    arrA.push(0);         // objB에 남아있는 key는 arrA에 없으므로 0을 넣어줌
  }
  
  //console.log('arrA:', arrA);
  //console.log('arrB:', arrB);

  var dot = 0;
  var aSum = 0, bSum = 0;
  var aTotal = 0, bTotal = 0;
  var length = arrA.length;

  aTotal = arrA.reduce((accumulator, a) => { // arrA에 있는 총합을 구함
    return accumulator + a;
  }, 0);

  bTotal = arrB.reduce((accumulator, a) => { // arrB에 있는 총합을 구함
    return accumulator + a;
  }, 0);

  for (var i = 0; i < length; i++) {
     // 태그 별 비율을 계산. 
     // ex) [1, 9, 0] => [10, 90, 0], [3, 3] => [50, 50], [0, 0] => [50, 50], [0, 1] => [0, 100]
    var tempA = aTotal === 0 ? (100 / length) : ( (arrA[i] / aTotal) * 100);
    var tempB = bTotal === 0 ? (100 / length) : ( (arrB[i] / bTotal) * 100);

    dot += tempA * tempB;
    aSum += tempA * tempA;
    bSum += tempB * tempB;
  }
  
  return dot / (Math.sqrt(aSum) * Math.sqrt(bSum)) // 코사인 유사도 계산
}

utils.isEmptyMap = (map) => {
  for (var [key, value] of map) {
    return false;
  }
  return true;
}

utils.calculateAccuracy = (mapA, mapB) => {
  var parentN = 0, childN = 0;

  //console.log('mapA:', mapA);
  //console.log('mapB:', mapB);

  for (var [key, value] of mapB) {
    parentN += 1;
    if (mapA.has(key)) {
      childN++;
    }
  }

  //console.log(parentN);
  //console.log(childN);
  
  //console.log('Accuracy: ', childN / parentN);
  return childN / parentN;
}

utils.calculateRecall = (mapA, mapB) => {
  var parentN = 0, childN = 0;
  //console.log('mapA:', mapA);
  //console.log('mapB:', mapB);

  for (var [key, value] of mapA) {
    parentN += 1;
    if (mapB.has(key)) {
      childN++;
    }
  }

  //console.log(parentN);
  //console.log(childN);

  if (parentN !== 0)
  //  console.log('Recall: ', childN / parentN);
    return childN / parentN;
  else
    //console.log('Recall: infinite');
    return 1;
}

module.exports = utils;
