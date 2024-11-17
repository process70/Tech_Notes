import React, { useEffect } from 'react'
import {store} from '../app/store'
import { usersSlice } from '../features/users/usersSlice'
import { notesSlice } from '../features/notes/notesSlice'
import { Outlet } from 'react-router-dom'

const Prefetch = () => {
    useEffect(() => {
        // Improved perceived performance: Data is often ready before the user requests it.
        // Reduced loading times: Subsequent navigations to notes or users pages will be faster.
        // This tells RTK Query to fetch the data for the 'getNotes' query and store it in its cache under the 'notesList' tag.
        // { force: true }. This option tells RTK Query to always make a network request, even if there's cached data available. 
        // This ensures you always have the most up-to-date data when the Prefetch component mounts.
        // store.dispatch(notesSlice.util.prefetch('getNotes', 'notesList', { force: true }))
        // store.dispatch(usersSlice.util.prefetch('getUsers', 'usersList', { force: true }))

        const notes = store.dispatch(notesSlice.endpoints.getNotes.initiate())
        const users = store.dispatch(usersSlice.endpoints.getUsers.initiate())

        return () => {
            console.log('unsubscribing')
            notes.unsubscribe()
            users.unsubscribe()
        }

    }, [])

    return <Outlet />
}

export default Prefetch
