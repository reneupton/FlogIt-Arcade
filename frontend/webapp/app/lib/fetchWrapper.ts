import { getTokenWorkaround } from "@/app/actions/authActions";

const rawBase =
  typeof window === "undefined"
    ? // During local dev use API_URL_LOCAL if provided, otherwise fall back to the public API URL
      process.env.API_URL_LOCAL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

const baseUrl = rawBase?.endsWith("/") ? rawBase : `${rawBase}/`;

async function get(url: string) {
    const requestOptions = {
        method: 'GET',
        header: await getHeaders()
    }

    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function post(url: string, body: {}){
    const requestOptions = {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
    }
    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function put(url: string, body: {}){
    const requestOptions = {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(body)
    }
    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function del(url: string){
    const requestOptions = {
        method: 'DELETE',
        headers: await getHeaders(),
    }
    const response = await fetch(baseUrl + url, requestOptions);
    return await handleResponse(response);
}

async function getHeaders(){
    const token = await getTokenWorkaround();
    const headers = {'Content-type': 'application/json'} as any;
    if(token) {
        headers.Authorization = 'Bearer ' + token.access_token
    }
    return headers;
}

async function handleResponse(response: Response) {
    const text = await response.text();
    
    let data;
    try {
        data = JSON.parse(text)
    } catch (error) {
        data = text;
    }

    if(response.ok){
        return data || response.statusText;
    } else {
        const error = {
            status : response.status,
            message : typeof data === 'string' && data.length > 0 ? data : response.statusText
        }

        return {error};
    }
}

export const fetchWrapper = {
    get,
    post,
    put,
    del
}
