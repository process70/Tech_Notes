import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const notesAdapter = createEntityAdapter({
    sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
})

const initialState = notesAdapter.getInitialState()

export const notesSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNotes: builder.query({
            query: () => '/notes/getAllNotes',
            // RESPONSE represents HTTP response object from the API call, It typically contains information
            // about the HTTP transaction like status, headers, ok
            // RESULT contains response body in JSON format or any error messages
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            transformResponse: responseData => {
                const loadedNotes = responseData?.map(note => {
                    note.id = note._id
                    // return edited note
                    return note
                });
                // creating a normalized data structure for users with ids array and entities object
                return notesAdapter.setAll(initialState, loadedNotes)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Note', id: 'LIST' },
                        // RTQ matching the tags provided by queries with those invalidated by mutations. 
                        // The 'LIST' id is a way for you to logically group all notes together for cache invalidation purposes.
                        ...result.ids.map(id => ({ type: 'Note', id }))
                    ]
                } else return [{ type: 'Note', id: 'LIST' }]
            }
        }),
        addNewNote: builder.mutation({
            query: initialNote => ({
                url: '/notes/createNote',
                method: 'POST',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: [
                { type: 'Note', id: "LIST" }
            ]
        }),
        updateNote: builder.mutation({
            query: initialNote => ({
                url: '/notes/update',
                method: 'PATCH',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: `/notes/delete`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                /* arg in this case is an object */
                { type: 'Note', id: arg.id }
            ]
        })
    }),
})

export const {useGetNotesQuery, useAddNewNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation} = notesSlice


// get the entire notes list result
export const selectNotesResult = notesSlice.endpoints.getNotes.select()

// extract the data from the result
const selectNotesData = createSelector(
    selectNotesResult,
    notesResult => notesResult.data // normalized state object with ids & entities
)

export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectUserIds
    // pass the data to create selectors for the notes
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState)
