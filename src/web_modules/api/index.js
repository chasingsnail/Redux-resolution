import axios from "axios";
const API_ROOT = "http://hades-api.dev.nongfenqi.com";
const http = (
  data,
  url,
  type = "POST",
  timeout = 10000,
  root = API_ROOT,
  isFormData
) => {
  const headers = { "Content-Type": "application/json" };
  const tokens = window.localStorage.getItem("x-auth-token");
  if (tokens) {
    headers["x-auth-token"] = tokens;
  }
  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }
  const options = {
    url: url,
    method: type,
    baseURL: root,
    headers: headers,
    timeout: timeout
  };

  if (type === "GET" || type === "DELETE") {
    options.params = data;
  } else {
    options.data = data;
  }
  return axios(options).then(response => {
    let { headers, data, status } = response;
    let token = headers["x-auth-token"];
    if (token) {
      window.localStorage.setItem("x-auth-token", token);
    }
    let contentType = headers["content-type"];
    if (status !== 200) {
      return Promise.reject(new Error("服务器请求失败"));
    }
    if (contentType && contentType.indexOf("application/json") !== -1) {
      let { retCode, retMsg } = data;
      if (retCode !== "10000") {
        switch (retCode) {
          case "16777218":
            window.localStorage.removeItem("x-auth-token");
            window.localStorage.removeItem("auth");
            window.localStorage.removeItem("userInfo");
            return Promise.reject(data);
          case "10005":
            window.localStorage.removeItem("x-auth-token");
            window.localStorage.removeItem("auth");
            window.localStorage.removeItem("userInfo");
            //message.error("过期或无效session，请重新登录");
            // location.reload(true);
            break;
          case "50104":
            window.localStorage.removeItem("x-auth-token");
            window.localStorage.removeItem("auth");
            window.localStorage.removeItem("userInfo");
            window.location.href = `/noAuth`;
            break;
          default:
            if (data.message) {
              // message.error(data.message);
              return Promise.reject(data);
            }
            break;
        }
      }
      return Promise.resolve(data);
    } else {
      return Promise.reject(new Error("the response is not JSON"));
    }
  });
};

export default http;
