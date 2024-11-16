import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null, user: null },
    reducers: {
        setCredentials: (state, action) => {
            const { accessToken } = action.payload
            state.token = accessToken
        },
        setUser: (state, action) => {
            state.user = action.payload.user
        },
        logOut: (state, action) => {
            state.token = null
        },
    }
})

export default authSlice.reducer;

export const { setCredentials, logOut, setUser } = authSlice.actions

export const selectCurrentToken = (state) => state.auth.token