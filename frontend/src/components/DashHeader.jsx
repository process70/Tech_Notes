import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileCirclePlus, faFilePen, faUserGear, faUserPlus, faRightFromBracket} from "@fortawesome/free-solid-svg-icons"
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useSendLogoutMutation } from '../features/auth/authApiSlice'
import useAuth from '../features/auth/useAuth'
const DASH_REGEX = /^\/dash(\/)?$/
const NOTES_REGEX = /^\/dash\/notes(\/)?$/
const USERS_REGEX = /^\/dash\/users(\/)?$/
const DashHeader = () => {
    const { isManager, isAdmin } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [sendLogout, {isSuccess, isLoading, isError, error }] = useSendLogoutMutation()
    const onNewNoteClicked = () => navigate('/dash/notes/create')
    const onNewUserClicked = () => navigate('/dash/users/create')
    const onNotesClicked = () => navigate('/dash/notes')
    const onUsersClicked = () => navigate('/dash/users')
    const handleLogOut = async () => {
        try {
            await sendLogout()
            navigate('/')
        } catch (err) {
           console.error('Logout failed:', err)
        }
    }
    let dashClass = null
    if (!DASH_REGEX.test(pathname) && !NOTES_REGEX.test(pathname) && !USERS_REGEX.test(pathname)) {
        dashClass = "dash-header__container--small"
    }
    let newNoteButton = null
    if (NOTES_REGEX.test(pathname)) {
        newNoteButton = (
            <button className="icon-button" title="New Note" onClick={onNewNoteClicked}>
                <FontAwesomeIcon icon={faFileCirclePlus} />
            </button>
        )
    }
    let newUserButton = null
    if (USERS_REGEX.test(pathname)) {
        newUserButton = (
            <button className="icon-button" title="New User" onClick={onNewUserClicked}>
                <FontAwesomeIcon icon={faUserPlus} />
            </button>
        )
    }
    let userButton = null
    if (isManager || isAdmin) {
        // dash/users/:id , dash/users/create
        // dash/notes , dash/notes/:id , dash/notes/create
        if (!USERS_REGEX.test(pathname) && pathname.includes('/dash')) {
            userButton = (
                <button className="icon-button" title="View All Users" onClick={onUsersClicked}>
                    <FontAwesomeIcon icon={faUserGear} />
                </button>
            )
        }
    }
    let notesButton = null
    if (!NOTES_REGEX.test(pathname) && pathname.includes('/dash')) {
        notesButton = (
            <button className="icon-button" title="View All Notes" onClick={onNotesClicked}>
                <FontAwesomeIcon icon={faFilePen} />
            </button>
        )
    }
    const logoutButton = (
        <button  className="icon-button" title="Logout" onClick={handleLogOut} >
            <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
    )
    const errClass = isError ? "errmsg" : "offscreen"

    let buttonContent
    if (isLoading) {
        buttonContent = <p>Logging Out...</p>
    } else {
        buttonContent = (
            <>{newNoteButton} {newUserButton} {notesButton} {userButton} {logoutButton} </>               
        )
    }
    const content = (
        <>
            <p className={errClass}>{isError &&  error.data.message}</p>
            <header className="dash-header">
                <div className={`dash-header__container ${dashClass}`}>
                    <Link to="/dash">
                        <h1 className="dash-header__title">techNotes</h1>
                    </Link>
                    <nav className="dash-header__nav">
                        {buttonContent}
                    </nav>
                </div>
            </header>
        </>
    )
    return content
}
export default DashHeader