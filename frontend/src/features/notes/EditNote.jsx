import { useState, useEffect } from "react"
import { useUpdateNoteMutation, useDeleteNoteMutation, selectNoteById } from "./notesSlice"
import { useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { selectAllUsers } from "../users/usersSlice"
import { useSelector } from "react-redux"
import useAuth from "../auth/useAuth"

const EditNote = () => {
  
  const users = useSelector(selectAllUsers)

  const {isAdmin, isManager} = useAuth()

  const {id} = useParams()

  const note = useSelector(state => selectNoteById(state, id))

  const [updateNote, { isLoading, isSuccess, isError, error }] = useUpdateNoteMutation()

  const [deleteNote, { isSuccess: isDelSuccess, isError: isDelError, error: delerror}] = useDeleteNoteMutation()

  const navigate = useNavigate()

  const [title, setTitle] = useState(note ? note.title : '')
  const [text, setText] = useState(note ? note.text : '')
  const [completed, setCompleted] = useState(note ? note.completed : false)
  const [userId, setUserId] = useState(note ? note.user : '')

  useEffect(() => {

      if (isSuccess || isDelSuccess) {
          setTitle('')
          setText('')
          setUserId('')
          navigate('/dash/notes')
      }

  }, [isSuccess, isDelSuccess, navigate])

  const onTitleChanged = e => setTitle(e.target.value)
  const onTextChanged = e => setText(e.target.value)
  const onCompletedChanged = e => setCompleted(prev => !prev)
  const onUserIdChanged = e => setUserId(e.target.value)

  const canSave = [title, text, userId].every(Boolean) && !isLoading

  const onSaveNoteClicked = async (e) => {
      if (canSave) {
          await updateNote({ id: note?.id, user: userId, title, text, completed })
      }
  }

  const onDeleteNoteClicked = async () => { 
      await deleteNote({ id: note.id })
  }

  const created = new Date(note ? note.createdAt : '').toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
  const updated = new Date(note ? note.updatedAt : '').toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })

  const options = users ? users.map(user => {
      return (
          <option key={user.id} value={user.id}> {user.username} </option>
      )
  }) : <option></option>

  const errClass = (isError || isDelError) ? "errmsg" : "offscreen"
  const validTitleClass = !title ? "form__input--incomplete" : ''
  const validTextClass = !text ? "form__input--incomplete" : ''

  const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

  let deleteButton = null
  if(isAdmin || isManager){
    deleteButton = (
        <button className="icon-button" title="Delete" onClick={onDeleteNoteClicked}>
                <FontAwesomeIcon icon={faTrashCan} />
        </button>
    )
  }

  const content = (
      <>
          <p className={errClass}>{errContent}</p>
          <form className="form" onSubmit={e => e.preventDefault()}>
              <div className="form__title-row">
                  <h2>Edit Note #{note ? note.ticket : ''}</h2>
                  <div className="form__action-buttons">
                      <button className="icon-button" title="Save" onClick={onSaveNoteClicked} disabled={!canSave}>
                          <FontAwesomeIcon icon={faSave} />
                      </button>
                      {deleteButton}
                  </div>
              </div>
              <label className="form__label" htmlFor="note-title">Title:</label>
              <input className={`form__input ${validTitleClass}`} id="note-title" name="title" 
                  type="text" autoComplete="off" value={title} onChange={onTitleChanged}/>

              <label className="form__label" htmlFor="note-text">Text:</label>
              <textarea className={`form__input form__input--text ${validTextClass}`} id="note-text"
                  name="text" value={text} onChange={onTextChanged}/>
              <div className="form__row">
                  <div className="form__divider">
                      <label className="form__label form__checkbox-container" htmlFor="note-completed">
                          WORK COMPLETE: </label>
                          <input className="form__checkbox" id="note-completed" name="completed"
                              type="checkbox" checked={completed} onChange={onCompletedChanged}/>

                      <label className="form__label form__checkbox-container" htmlFor="note-username">ASSIGNED TO:</label>                          
                      <select id="note-username" name="username" className="form__select" value={userId}onChange={onUserIdChanged}>
                          {options}
                      </select>
                  </div>
                  <div className="form__divider">
                      <p className="form__created">Created:<br />{created}</p>
                      <p className="form__updated">Updated:<br />{updated}</p>
                  </div>
              </div>
          </form>
      </>
  )
  return content
}

export default EditNote