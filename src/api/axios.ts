import * as vscode from "vscode";
import axios, { AxiosRequestConfig } from "axios";
import { getCooKie } from "@/config";

const server = axios.create({
  timeout: 6000,
  baseURL: "https://api.juejin.cn/booklet_api/v1",
});

server.interceptors.request.use(
  function (config) {
    config.headers!["cookie"] = getCooKie();
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

server.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    vscode.window.showErrorMessage(error.message);
    return Promise.reject(error);
  }
);

export default server;

export const baseURL = () => server.defaults.baseURL;

interface MyResponseType {
  code: number;
  message: string;
  data: any;
}

export const request = async (
  config: AxiosRequestConfig
): Promise<MyResponseType> => {
  const {
    status: code,
    statusText: message,
    data,
  } = await server.request<MyResponseType>(config).catch((e) => {
    return {
      status: 500,
      statusText: e.message,
      data: null,
    };
  });
  return {
    code,
    message,
    data: data?.data,
  };
};
