import React, {useCallback, useEffect} from "react";
import "./App.css";
import {AppBar, Button, Container, IconButton, LinearProgress, Toolbar, Typography} from "@material-ui/core";
import {Menu} from "@material-ui/icons";
import {TodolistsList} from "../features/TodolistsList/TodolistsList";
import {ErrorSnackbar} from "../components/ErrorSnackbar/ErrorSnackbar";
import {useDispatch, useSelector} from "react-redux";
import {AppRootStateType} from "./store";
import {initializeApp, RequestStatusType} from "./app-reducer";
import {BrowserRouter, Redirect, Route} from "react-router-dom";
import {Login} from "../features/Login/Login";
import {logout} from "../features/Login/auth-reducer";

type PropsType = {
    demo?: boolean;
};

function App({demo = false}: PropsType) {
    const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status);
    const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.app.isInitialized);
    const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeApp());
    }, []);

    const logoutHandler = useCallback(() => {
        dispatch(logout());
    }, []);

    return (
        <BrowserRouter>
            {!isInitialized ? <Redirect to="/login" /> : ""}
            <div className="App">
                <ErrorSnackbar />
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <Menu />
                        </IconButton>
                        <Typography variant="h6">News</Typography>
                        {isLoggedIn && (
                            <Button color="inherit" onClick={logoutHandler}>
                                Log out
                            </Button>
                        )}
                    </Toolbar>
                    {status === "loading" && <LinearProgress />}
                </AppBar>
                <Container fixed>
                    <Route exact path={"/"} render={() => <TodolistsList demo={demo} />} />
                    <Route path={"/login"} render={() => <Login />} />
                </Container>
            </div>
        </BrowserRouter>
    );
}

export default App;
