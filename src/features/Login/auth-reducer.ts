import {setAppStatusAC} from "../../app/app-reducer";
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createSlice, PayloadAction, createAsyncThunk} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

const initialState: InitialStateType = {
    isLoggedIn: false,
};

export const login = createAsyncThunk("auth/login", async (data: LoginParamsType, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
    try {
        return await authAPI
            .login(data)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                    return {value: true};
                } else {
                    handleServerAppError(res.data, thunkAPI.dispatch);
                    return {value: false};
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, thunkAPI.dispatch);
                return {value: false};
            });
    } catch (e) {
        const err = e as Error | AxiosError<{error: string}>;
        handleServerNetworkError(err, thunkAPI.dispatch);
        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
        return {value: false};
    }
});

export const logout = createAsyncThunk("auth/logout", async (args, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
    try {
        return await authAPI
            .logout()
            .then((res) => {
                if (res.data.resultCode === 0) {
                    thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                    return {value: false};
                } else {
                    handleServerAppError(res.data, thunkAPI.dispatch);
                    return {value: false};
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, thunkAPI.dispatch);
                return {value: false};
            });
    } catch (e) {
        const err = e as Error | AxiosError<{error: string}>;
        handleServerNetworkError(err, thunkAPI.dispatch);
        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
        return {value: false};
    }
});

const slice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setIsLoggedInAC: (state, action: PayloadAction<{value: boolean}>) => {
            state.isLoggedIn = action.payload.value;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.value;
            })
            .addCase(logout.fulfilled, (state, action) => {
              console.log(3)
              state.isLoggedIn = action.payload.value;
            });
    },
});

export const authReducer = slice.reducer;
export const {setIsLoggedInAC} = slice.actions;

// export const logoutTC = () => (dispatch: Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>) => {
//     dispatch(setAppStatusAC({status: "loading"}));
//     authAPI
//         .logout()
//         .then((res) => {
//             if (res.data.resultCode === 0) {
//                 // dispatch(setIsLoggedInAC({value: false}));
//                 dispatch(setAppStatusAC({status: "succeeded"}));
//             } else {
//                 handleServerAppError(res.data, dispatch);
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch);
//         });
// };

// types

// type ActionsType = ReturnType<typeof setIsLoggedInAC>;
type InitialStateType = {
    isLoggedIn: boolean;
};

// type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>;
