import React, { createContext, useEffect, useReducer } from "react";
import api, { fetchCsrfToken } from "../api/axiosClient";

const initialState = { user: null, loading: true };

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };
    case "CLEAR_USER":
      return { user: null, loading: false };
    case "LOADING_DONE":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const csrf = await fetchCsrfToken();
        const res = await api.post(
          "/api/auth/refresh-token",
          {},
          {
            headers: { "X-CSRF-Token": csrf },
          }
        );
        if (res.data && res.data.user) {
          dispatch({ type: "SET_USER", payload: res.data.user });
        } else {
          dispatch({ type: "LOADING_DONE" });
        }
      } catch (error) {
        dispatch({ type: "LOADING_DONE" });
      }
    })();
  }, []);

  const login = async (email, password, userType = "user") => {
    const route =
      userType === "organizer"
        ? "/api/auth/login-organizer"
        : "/api/auth/login-user";
    const csrf = await fetchCsrfToken();
    const resp = await api.post(
      route,
      { email, password, userType },
      { headers: { "X-CSRF-Token": csrf } }
    );
    if (resp.data && resp.data.user) {
      dispatch({ type: "SET_USER", payload: resp.data.user });
    }
    return resp.data;
  };

  const register = async (userName, email, password, userType = "user") => {
    const payload = { userName, email, password, userType };
    const csrf = await fetchCsrfToken();
    const resp = await api.post("/api/auth/register", payload, {
      headers: { "X-CSRF-Token": csrf },
    });

    return resp.data;
  };

  const logout = async () => {
    const csrf = await fetchCsrfToken();
    await api.post("/api/auth/logout", {}, {
      headers: { "X-CSRF-Token": csrf },
    });
    dispatch({ type: "CLEAR_USER" });
  };

  const logoutAll = async () => {
    const csrf = await fetchCsrfToken();
    await api.post("/api/auth/logout-all", {}, {
      headers: { "X-CSRF-Token": csrf },
    });
    dispatch({ type: "CLEAR_USER" });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, dispatch, login, register, logout, logoutAll }}
    >
      {children}
    </AuthContext.Provider>
  );
};
