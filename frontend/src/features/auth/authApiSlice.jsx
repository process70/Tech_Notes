import { apiSlice } from "../../app/api/apiSlice"
import { logOut, setCredentials, setUser } from "./authSlice"

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        sendLogout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            // { dispatch, queryFulfilled }: destructed from an api
            async  onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    // Wait for the logout API call to complete
                    // A promise that resolves when the query or mutation is fulfilled successfully.
                    await queryFulfilled
                    dispatch(logOut()) // update the auth state
                    // Reset the entire API state manages by RTQ
                    // That's include API call results, pending requests, 
                    // and other metadata related to your API interactions.
                    // Cancels any ongoing queries or mutations
                    // Resets all query subscriptions
                    // Clears any error states from failed queries
                    // Ensure that no ongoing API calls continue after the user has logged out
                    dispatch(apiSlice.util.resetApiState())
                } catch (err) {
                    console.error('Error during logout:', err);
                }
            }
        }),
        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'GET',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    // console.log(data)
                    const { accessToken } = data
                    const { user } = data
                    dispatch(setCredentials({ accessToken }))
                    dispatch(setUser({user}))
                } catch (err) {
                    console.log(err)
                }
            }
        }),
    })
})

export const {
    useLoginMutation,
    useSendLogoutMutation,
    useRefreshMutation,
} = authApiSlice 
