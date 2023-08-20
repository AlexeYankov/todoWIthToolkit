import { addTodo, fetchTodo, removeTodo} from "./todolists-reducer";
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api";
import {AppRootStateType} from "../../app/store";
import {setAppStatusAC} from "../../app/app-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

const initialState: TasksStateType = {};

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
    try {
        return await todolistsAPI
            .getTasks(todolistId)
            .then((res) => {
                const tasks = res.data.items;
                //   dispatch(setTasksAC({ tasks, todolistId }));
                thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                return {tasks, todolistId};
            })
            .catch((error) => {
                thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                handleServerAppError(error.data, thunkAPI.dispatch);
                const tasks = [] as TaskType[];
                return {tasks, todolistId};
            });
    } catch (e) {
        const err = e as Error | AxiosError<{error: string}>;
        handleServerNetworkError(err, thunkAPI.dispatch);
        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
        const tasks = [] as TaskType[];
        return {tasks, todolistId};
    }
});
export const addTaskToTodo = createAsyncThunk(
    "tasks/addTask",
    async (param: {title: string; todolistId: string}, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
        try {
            return await todolistsAPI.createTask(param.todolistId, param.title).then((res) => {
                if (res.data.resultCode === 0) {
                    const task = res.data.data.item;
                    // const action = addTaskAC({task});
                    // thunkAPI.dispatch(action);
                    console.log(task);
                    thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                    return {task};
                } else {
                    handleServerAppError(res.data, thunkAPI.dispatch);
                    thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                    const task = {} as TaskType;
                    return {task};
                }
            });
        } catch (e) {
            const err = e as Error | AxiosError<{error: string}>;
            handleServerNetworkError(err, thunkAPI.dispatch);
            thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
            const task = {} as TaskType;
            return {task};
        }
    }
);
export const removeTaskFromTodo = createAsyncThunk(
    "tasks/removeTask",
    async (param: {taskId: string; todolistId: string}, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
        try {
            return await todolistsAPI
                .deleteTask(param.todolistId, param.taskId)
                .then((res) => {
                    const todolistId = param.todolistId;
                    const taskId = param.taskId;
                    thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                    return {todolistId, taskId};
                })
                .catch((error) => {
                    thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                    handleServerAppError(error.data, thunkAPI.dispatch);
                    const todolistId = param.todolistId;
                    const taskId = param.taskId;
                    return {todolistId, taskId};
                });
        } catch (e) {
            const err = e as Error | AxiosError<{error: string}>;
            handleServerNetworkError(err, thunkAPI.dispatch);
            thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
            const todolistId = param.todolistId;
            const taskId = param.taskId;
            return {todolistId, taskId};
        }
    }
);
export const updateTodoTask = createAsyncThunk(
    "tasks/updateTask",
    async (param: {taskId: string; domainModel: UpdateDomainTaskModelType; todolistId: string}, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: "loading"}));
        const state = thunkAPI.getState() as AppRootStateType;
        
        const task = state.tasks[param.todolistId].find((t) => t.id === param.taskId) || {} as TaskType;
        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...param.domainModel,
        };
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn("task not found in the state");
            const todolistId = param.todolistId;
                        const taskId = param.taskId;
                        const domainModelCopy = apiModel;
                        thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                        return {taskId, model: domainModelCopy, todolistId};
        }
        
        try {return await todolistsAPI
                .updateTask(param.todolistId, param.taskId, apiModel)
                .then((res) => {
                    if (res.data.resultCode === 0) {
                        const todolistId = param.todolistId;
                        const taskId = param.taskId;
                        const domainModelCopy = apiModel;
                        thunkAPI.dispatch(setAppStatusAC({status: "succeeded"}));
                        return {taskId, model: domainModelCopy, todolistId};
                    } else {
                        thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
                        handleServerAppError(res.data, thunkAPI.dispatch);
                        const todolistId = param.todolistId;
                        const taskId = param.taskId;
                        const domainModelCopy = apiModel;
                        return {taskId, model: domainModelCopy, todolistId};
                    }
                })
        } catch (e) {
            const err = e as Error | AxiosError<{error: string}>;
            handleServerNetworkError(err, thunkAPI.dispatch);
            thunkAPI.dispatch(setAppStatusAC({status: "failed"}));
            const todolistId = param.todolistId;
            const taskId = param.taskId;
            const domainModelCopy = apiModel;
            return {taskId, model: domainModelCopy, todolistId};
        }
    }
);

const slice = createSlice({
    name: "tasks",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(removeTodo.fulfilled, (state, action) => {
                delete state[action.payload.id];
            })
            .addCase(addTodo.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = [];
            })
            .addCase(fetchTodo.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl: any) => {
                    state[tl.id] = [];
                });
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks;
            })
            .addCase(addTaskToTodo.fulfilled, (state, action) => {
                state[action.payload.task.todoListId] = [action.payload.task, ...state[action.payload.task.todoListId]];
            })
            .addCase(removeTaskFromTodo.fulfilled, (state, action) => {
                state[action.payload.todolistId] = state[action.payload.todolistId].filter(
                    (t) => t.id != action.payload?.taskId
                );
            })
            .addCase(updateTodoTask.fulfilled, (state, action) => {
                state[action.payload.todolistId] = state[action.payload.todolistId].map((t) =>
                    t.id === action.payload?.taskId ? {...t, ...action.payload.model} : t
                );
            });
    },
});

export const tasksReducer = slice.reducer;

// types
export type UpdateDomainTaskModelType = {
    title?: string;
    description?: string;
    status?: TaskStatuses;
    priority?: TaskPriorities;
    startDate?: string;
    deadline?: string;
};
export type TasksStateType = {
    [key: string]: Array<TaskType>;
};
