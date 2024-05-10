import { atom } from "jotai";
import { Theme } from "./ai";

export const themeAtom = atom<Theme | undefined>(undefined);
