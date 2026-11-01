"use client";
import { useSyncExternalStore } from "react";

// sessionStorage はブラウザにしかないので、ここでは null を返す
const serverDemoMode = () => null;

//ブラウザの sessionStorage から demoMode の値を読む
const readDemoMode = () => {
  try {
    return sessionStorage.getItem("demoMode");
  } catch {
    return null;
  }
};

//ブラウザで変化を見張る
const noWatch = () => () => {};

// デモのモード（"guided" / "free" / null）を読む
export const useDemoMode = () =>
  useSyncExternalStore(noWatch, readDemoMode, serverDemoMode);
