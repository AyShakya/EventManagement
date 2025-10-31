import { createContext, useReducer } from "react";
import api from "../api/axiosClient";

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

export const AuthProivder = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post("/api/auth/refresh-token");
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

  const login = async (email, password, userType = 'user') => {
    const route = userType === 'organizer' ? '/api/auth/login-organizer' : '/api/auth/login-user';
    const resp = await api.post(route, { email, password});
    if (resp.data && resp.data.user) {
        dispatch({ type: 'SET_USER', payload: resp.data.user });
    }
    return resp.data;
  }

  const logout = async () => {
    const csrf = await import('../api/axiosClient').then(m => m.fetchCsrfToken());
    await api.post('/api/auth/logout', null, {headers: {'X-CSRF-Token': csrf}});    
    dispatch({ type: 'CLEAR_USER' });
  }

  return (
    <AuthContext.Provider value={{...state, dispatch, login, logout}}>
        {children}
    </AuthContext.Provider>
  )
};
