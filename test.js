function quickSort(arr){
  // 1、从数组arr中拿出中间项mid
  // 2、声明左右两个数组，循环arr，比mid小push到左数组，否则push到右数组
  // 3、对左右两个数组进行递归处理，把左数组，中间值，右数组拼在一起
  // 4、如果数组里面只有一项或者没有，那么原封不动返回数组
  if(arr.length<=1) return arr
  let middleIndex = parseInt(arr.length/2)
  let middleValue = arr.splice(middleIndex, 1)[0]
  let arrLeft = []
  let arrRight = []
  for(let i=0;i<arr.length;i++) {
    let item = arr[i];
    item<middleValue ? arrLeft.push(item) : arrRight.push(item)
  }
  return quickSort(arrLeft).concat(middleValue, quickSort(arrRight))
}