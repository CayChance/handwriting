// fetch 是新的请求接口方法. 如: 获取user我们可以像下面这样调用:
fetch('/user').then(user => {})
// 请将fetch封装为一个函数xFetch, 让fetch 支持超时后返回,超时异常
// 如
xFetch('/user', {timeout: 3000}).catch(err => {
  if(err.code == -1) {
    console.log('请求超时')
  }
});

function xFetch(path, params) {
  return new Promise((resolve, reject)=>{
    fetch(path).then(data=>{
      setTimeout(()=>{
        if(data) {
          resolve(data)
        }
        else {
          reject({code: -1})
        }
      }, params.timeout)
    })
  })
}


// axios请求失败的时候再重试一遍
function axiosAutoTry(data) {
  return new Promise((resolve, reject) => {
    axios(data)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        // 有重试次数
        if (typeof data.__try_count == "number" && data.__try_count > 0) {
          console.error("重试请求", error.message, data);
          data.__try_count--;
          return resolve(axiosAutoTry(data));
        }
        reject(error);
      });
  });
}

// 实现一个红绿灯
// 红灯亮(打印)3s后，绿灯亮(打印)2s后，黄灯亮(打印)1s后循环
function log(num) {
  let map = ["", "yellow", "green", "red"];
  return new Promise((resolve, reject) => {
    console.log(map[num], num);
    setTimeout(() => {
      if (num <= 1) num = 4;
      resolve(num);
    }, num * 1000);
  });
}
function light(num) {
  num--;
  return new Promise((resolve, reject) => {
    log(num).then((data) => {
      light(data);
    });
  });
}

light(4);
