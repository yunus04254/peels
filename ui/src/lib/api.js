const API_ENDPOINT = "http://localhost:1234/";


const Post = async (url, data, params, options={}) => {
    const param_string = params ? new URLSearchParams(params).toString() : "";
    var headers = options.headers || {};
    const user = options.user;
    if (user){
        headers["Authorization"] = `Bearer ${user.accessToken}`;
    }
    headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_ENDPOINT}${url}?${param_string}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    });
    return response;
}


const Get = async (url, params, options={}) => {
    const param_string = params ? new URLSearchParams(params).toString() : "";
    var headers = options.headers || {};
    const user = options.user;
    if (user){
        headers["Authorization"] = `Bearer ${user.accessToken}`;
    }
    const response = await fetch(`${API_ENDPOINT}${url}?${param_string}`, {
        method: "GET",
        headers: headers,

    });
    return response;
}

const Put = async (url, data, params, options={}) => {
    const param_string = params ? new URLSearchParams(params).toString() : "";
    var headers = options.headers || {};
    const user = options.user;
    if (user){
        headers["Authorization"] = `Bearer ${user.accessToken}`;
    }
    headers["Content-Type"] = "application/json";
    const response = await fetch(`${API_ENDPOINT}${url}?${param_string}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(data),
    });
    return response;
}

const Delete = async (url, params, options = {}) => {
    const param_string = params ? new URLSearchParams(params).toString() : "";
    var headers = options.headers || {};
    const user = options.user;
    if (user) {
        headers["Authorization"] = `Bearer ${user.accessToken}`;
    }
    const response = await fetch(`${API_ENDPOINT}${url}?${param_string}`, {
        method: "DELETE",
        headers: headers,
    });
    return response;

};


module.exports = { Post, Get, Put, Delete}

