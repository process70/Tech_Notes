/* eslint-disable no-undef */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_BASE_URL}`,
    credentials: 'include', // include credentials (like cookies) with every request.
    // 'include' means that the credentials will be sent along with the request.

    // getState(): A function to access the current Redux state
    // useSelector is a React hook, which can only be used inside React functional components or custom hooks.
    // so we can't replace getState() by useSelector(state => state.auth.token)
    // prepareHeaders runs before each request and allows you to customize the headers
    // the main reason why we don't use headers instead of prepareHeaders is headers property 
    // does not have access to redux state
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token

        if (token)  {
            headers.set("authorization", `Bearer ${token}`)
        }
        
        return headers // Return the edited headers
    }
})

// handle token expiration without the need for manual intervention in each API call.
const baseQueryWithReauth = async (args, api, extraOptions) => {
    // args: The original query arguments (URL, method, body, etc.)
    // api: An object containing utilities like signal, dispatch, and getState
    // Any additional options passed to the query
    // the outer baseQuery is a result of fetchBaseQuery that return a function that have 3 parameters
    // the URL of args parameter can be /notes/createNote or /users/deleteUser appended with baseUrl
    let result = await baseQuery(args, api, extraOptions)
    // result.data for successful requests ans result.error or failed requests
    // result?.error?.status === 401 means token not provided means the client is not authenticated
    if (result?.error?.status === 403) {  // accessToken expired 
        console.log('sending refresh token')
        // send refresh token to get new access token 
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
        if (refreshResult?.data) {
            // store the new access token 
            api.dispatch(setCredentials({ ...refreshResult.data })) // Ensure immutability.
            // retry original query with new access token
            result = await baseQuery(args, api, extraOptions)
        } else {
            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = "Your login has expired. "
            }
            return refreshResult
        }
    }

    return result
}

export const apiSlice = createApi({
    // reducerPath = 'Api'
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Note', 'User'],
    endpoints: builder => ({})
})