import React from 'react'
import Note from './Note'
import { useGetNotesQuery } from './notesSlice'
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import useAuth from '../auth/useAuth'

const NotesList = () => {
  const {data: notes, isLoading, isError, isSuccess, error} = useGetNotesQuery("notesList", {
    pollingInterval: 6000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
})
const {pathname} = useLocation()
const {isAdmin, isManager, username} = useAuth()

const DASH_REGEX = /^\/dash(\/)?$/
const NOTES_REGEX = /^\/dash\/notes(\/)?$/
const USERS_REGEX = /^\/dash\/users(\/)?$/

useEffect(() => {
    console.log("pathname : "+pathname)
    console.log("notes test : "+NOTES_REGEX.test(pathname))
    console.log("users test : "+USERS_REGEX.test(pathname))
// eslint-disable-next-line react-hooks/exhaustive-deps
},[])
  let content

  if (isLoading) content = <p>Loading...</p>

  if (isError) {
      content = <p className={isError ? 'errmsg' : 'offscreen'}>{error?.data?.message}</p>
  }

    if (isSuccess) {
        const { ids, entities } = notes
        let filteredIds;
        if(isAdmin || isManager) filteredIds = ids
        else filteredIds = ids.filter(id => entities[id].username === username)

        const tableContent = filteredIds?.length
            ? filteredIds.map(noteId => <Note key={noteId} noteId={noteId} />)
            : null

        content = (
            <table className="table table--notes">
                <thead className="table__thead">
                    <tr>
                        <th scope="col" className="table__th note__status">Username</th>
                        <th scope="col" className="table__th note__created">Created</th>
                        <th scope="col" className="table__th note__updated">Updated</th>
                        <th scope="col" className="table__th note__title">Title</th>
                        <th scope="col" className="table__th note__username">Owner</th>
                        <th scope="col" className="table__th note__edit">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {tableContent}
                </tbody>
            </table>
        )
    }

    return content
}

export default NotesList