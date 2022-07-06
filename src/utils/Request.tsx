import { message } from 'antd';
import Axios, { AxiosRequestConfig } from 'axios';
import { history } from 'umi';

export default function Request(config: AxiosRequestConfig, callback: (res: any) => any, pathParams?: any) {
    let url: string | undefined = config.url;
    if (pathParams != null) {
        if (Object.keys(pathParams).length && url !== undefined) {
            for (let key in pathParams) {
                let reg = new RegExp(`{${key}}`);
                url = url?.replace(reg, pathParams[key]);
            }
        }
    }

    config.url = url;
    if (localStorage.getItem('token') !== null) {
        config.headers = {
            ...config.headers,
            "Access-Token": localStorage.getItem('token') as string,
            "X-User-Id": localStorage.getItem('id') as string,
        }
    }
    Axios(config)
        .then(res => {
            console.log(res);
            if (res.data.code !== 1000) {
                message.error(res.data.message);
            } else {
                callback(res);
            }
        }).catch(err => {
            message.error('request error');
            console.log(err);
            if (err.response.status === 401) {
                console.log("back to login");

                history.push("/login");
            }
        })
}

export async function async_request<T>(config: AxiosRequestConfig, callback: (res: any) => T, pathParams?: any): Promise<T> {
    let url: string | undefined = config.url;
    if (pathParams != null) {
        if (Object.keys(pathParams).length && url !== undefined) {
            for (let key in pathParams) {
                let reg = new RegExp(`{${key}}`);
                url = url?.replace(reg, pathParams[key]);
            }
        }
    }

    config.url = url;
    if (localStorage.getItem('token') !== null) {
        config.headers = {
            ...config.headers,
            "Access-Token": localStorage.getItem('token') as string,
            "X-User-Id": localStorage.getItem('id') as string,
        }
    }
    return Axios(config)
        .then(res => {
            if (res.data.code !== 1000) {
                message.error(res.data.message);
                return res.data
            } else {
                return callback(res);
            }
        }).catch(err => {
            message.error('request error');
            console.log(err);
            if (err.response.status === 401) {
                console.log("back to login");

                history.push("/login");
            }
        });
}