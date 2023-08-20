import {todolistsAPI, TodolistType} from "../../api/todolists-api";
import {RequestStatusType, setAppStatusAC} from "../../app/app-reducer";
import {handleServerNetworkError} from "../../utils/error-utils";
import {createSlice, PayloadAction, createAsyncThunk} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

const initialState: TodolistDomainType[] = [];

export const fetchTodo = createAsyncThunk("todo/fetchTodo", async (args, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
    try {
        return await todolistsAPI
            .getTodolists()
            .then((res) => {
                let todos = res.data;
                thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));

                return {todolists: todos};
            })
            .catch((error) => {
                thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                handleServerNetworkError(error, thunkAPI.dispatch);
                const todos = [] as TodolistType[];
                return {todolists: todos};
            });
    } catch (e) {
        const err = e as Error | AxiosError<{error: string}>;
        handleServerNetworkError(err, thunkAPI.dispatch);
        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
        const todos = [] as TodolistType[];
        return {todolists: todos};
    }
});

export const addTodo = createAsyncThunk("todo/addTodo", async (title: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
    try {
        return await todolistsAPI
            .createTodolist(title)
            .then((res) => {
                let todos = res.data.data.item;
                thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                return {todolist: todos};
            })
            .catch((error) => {
                thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                handleServerNetworkError(error, thunkAPI.dispatch);
                const todos = {} as TodolistType;
                return {todolist: todos};
            });
    } catch (e) {
        const err = e as Error | AxiosError<{error: string}>;
        handleServerNetworkError(err, thunkAPI.dispatch);
        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
        const todos = {} as TodolistType;
        return {todolist: todos};
    }
});

export const removeTodo = createAsyncThunk("todo/removeTodo", async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
    try {
        return await todolistsAPI
            .deleteTodolist(todolistId)
            .then((res) => {
                thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                return {id: todolistId};
            })
            .catch((error) => {
                thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                handleServerNetworkError(error, thunkAPI.dispatch);
                return {id: todolistId};
            });
    } catch (e) {
        const err = e as Error | AxiosError<{error: string}>;
        handleServerNetworkError(err, thunkAPI.dispatch);
        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
        return {id: todolistId};
    }
});

export const changeTodoTitle = createAsyncThunk(
    "todo/changeTodoTitle",
    async (param: {id: string; title: string}, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
        try {
            return await todolistsAPI
                .updateTodolist(param.id, param.title)
                .then((res) => {
                    thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                    const id = param.id;
                    const title = param.title;
                    return {id, title};
                })
                .catch((error) => {
                    thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                    handleServerNetworkError(error, thunkAPI.dispatch);
                    const id = param.id;
                    const title = param.title;
                    return {id, title};
                });
        } catch (e) {
            const err = e as Error | AxiosError<{error: string}>;
            handleServerNetworkError(err, thunkAPI.dispatch);
            thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
            const id = param.id;
            const title = param.title;
            return {id, title};
        }
    }
);

const slice = createSlice({
    name: "todolist",
    initialState: initialState,
    reducers: {
        changeTodolistFilterAC: (state, action: PayloadAction<{id: string; filter: FilterValuesType}>) => {
            return state.map((tl) => (tl.id === action.payload.id ? {...tl, filter: action.payload.filter} : tl));
        },
        changeTodolistEntityStatusAC: (state, action: PayloadAction<{id: string; status: string}>) => {
            state.map((tl) => (tl.id === action.payload.id ? {...tl, entityStatus: action.payload.status} : tl));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodo.fulfilled, (state, action) => {
                return (state = action.payload.todolists.map((tl) => ({
                    ...tl,
                    filter: "all",
                    entityStatus: "idle",
                })));
            })
            .addCase(addTodo.fulfilled, (state, action) => {
                state.unshift({...action.payload.todolist, filter: "all", entityStatus: "idle"});
            })
            .addCase(removeTodo.fulfilled, (state, action) => {
                return state.filter((tl) => tl.id != action.payload.id);
            })
            .addCase(changeTodoTitle.fulfilled, (state, action) => {
                return state.map((tl) => (tl.id === action.payload.id ? {...tl, title: action.payload.title} : tl));
            })
    },
});

export const todolistsReducer = slice.reducer;
export const {
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
} = slice.actions;

export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
};
