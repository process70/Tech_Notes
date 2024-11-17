import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";

import { apiSlice } from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({})

// Define the initial state for the users slice
const initialState = usersAdapter.getInitialState()

export const usersSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => '/users/getAllUsers',
            // RESPONSE represents HTTP response object from the API call, It typically contains information
            // about the HTTP transaction like status, headers, ok
            // RESULT contains response body in JSON format or any error messages
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },           
            transformResponse: responseData => {
                if (!Array.isArray(responseData)) {
                    return usersAdapter.setAll(initialState, [])
                }
                const loadedUsers = responseData.map(user => {
                    user.id = user._id
                    // return edited user
                    return user
                });
                // creating a normalized data structure for users with ids array and entities object
                return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'User', id: 'LIST' },
                        // RTQ matching the tags provided by queries with those invalidated by mutations. 
                        // The 'LIST' id is a way for you to logically group all users together for cache invalidation purposes.
                        ...result.ids.map(id => ({ type: 'User', id }))
                    ]
                } else return [{ type: 'User', id: 'LIST' }]
            }
        }),
        addNewUser: builder.mutation({
            query: initialUserData => ({
                url: '/users/createUser',
                method: 'POST',
                body: { ...initialUserData}
            }),
            invalidatesTags: [{type: 'User', id: 'LIST'}]
        }),
        updateUser: builder.mutation({
            query: initialUserData => ({
                url: '/users/update',
                method: 'PATCH',
                body: {
                    ...initialUserData,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id }
            ]
        }),
        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: `/users/delete`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'User', id: arg.id }
            ]
        }),
    }),
})

export const {useGetUsersQuery, useAddNewUserMutation, useDeleteUserMutation, useUpdateUserMutation} = usersSlice

// Select the entire query result from the Redux store
export const selectUsersResult = usersSlice.endpoints.getUsers.select()

// create memoized selector with normalized state object inluding ids and entities
const getUsersSelector = createSelector(
    selectUsersResult,
    usersResult => usersResult.data
)
// getSelectors method creates prebuilt selectors
export const {
    selectById: selectUserById,
    selectAll: selectAllUsers,
    selectIds: selectUserIds
} = usersAdapter.getSelectors(state => getUsersSelector(state) ?? usersAdapter.getInitialState())
