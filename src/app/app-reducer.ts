import { Dispatch } from "redux";
import { authAPI } from "../api/todolists-api";
import { setIsLoggedInAC } from "../features/Login/auth-reducer";
import {handleServerAppError, handleServerNetworkError} from "../utils/error-utils";
import {createSlice, PayloadAction, createAsyncThunk} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

const initialState: InitialStateType = {
  status: "idle",
  error: null,
  isInitialized: false,
};

export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed";
export type InitialStateType = {
  // происходит ли сейчас взаимодействие с сервером
  status: RequestStatusType;
  // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
  error: string | null;
  // true когда приложение проинициализировалось (проверили юзера, настройки получили и т.д.)
  isInitialized: boolean;
};



export const initializeApp = createAsyncThunk("app/me", async (args, thunkAPI) => {
  thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
  try {
      return await authAPI
          .me()
          .then((res) => {
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setIsLoggedInAC({ value: true }));
                thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                return {value: true}
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch);
                return {value: false}
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, thunkAPI.dispatch);
            return {value: false}
        });
  } catch (e) {
      const err = e as Error | AxiosError<{error: string}>;
      handleServerNetworkError(err, thunkAPI.dispatch);
      thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
      return {value: false}
  }
});

const slice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: {
    setAppErrorAC: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error;
    },
    setAppStatusAC: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status;
    },
    setAppInitializedAC: (state, action: PayloadAction<{ value: boolean }>) => {
      state.isInitialized = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeApp.fulfilled, (state, action) => {
      state.isInitialized = action.payload.value
    });
},
  
});

export const appReducer = slice.reducer;
export const { setAppErrorAC, setAppStatusAC, setAppInitializedAC } = slice.actions;

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>;
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>;
