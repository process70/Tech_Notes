import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'
import usePersist from '../persist/usePersist'

const Login = () => {
    const userRef = useRef()
    const errRef = useRef()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [persist, setPersist] = usePersist()

    const [login, { isLoading }] = useLoginMutation()

    useEffect(() => {
        userRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [username, password])


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
			// unwrap allows us to use try-catch block accordingly
            const { accessToken } = await login({ username, password }).unwrap()
            dispatch(setCredentials({ accessToken }))
            setUsername('')
            setPassword('')
            navigate('/dash')
        } catch (err) {
            if (!err.status) {
                setErrMsg('No Server Response');
            } else {
                setErrMsg(err.data?.message);
            }
			
        }
    }

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePwdInput = (e) => setPassword(e.target.value)
    const handleToggle = () => {
    //    console.log("the old persist value : " + persist)
       setPersist(prev => {
        //    console.log("the new persist value : " + !prev)
           return !prev
       })
    }

    const errClass = errMsg ? "errmsg" : "offscreen"

    if (isLoading) return <p>Loading...</p>

    const content = (
        <section className="public">
            <header>
                <h1>Employee Login</h1>
            </header>
            <main className="login">
                <p className={errClass}>{errMsg}</p>

                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username:</label>
                    <input className="form__input"  type="text" id="username" ref={userRef}
                           value={username} onChange={handleUserInput} autoComplete="off"required />

                    <label htmlFor="password">Password:</label>
                    <input className="form__input" type="password" id="password"
                           onChange={handlePwdInput} value={password} required/>
                    <button className="form__submit-button">Sign In</button>

                    {/* enable persist login */}
                    <label htmlFor="persist" className="form__persist">
                        <input type="checkbox" className="form__checkbox" id="persist"
                            onChange={handleToggle} checked={persist}/>
                        Trust This Device</label>
                </form>
                <p>You do not have an account: <Link to="/register">Register</Link></p>
            </main>
            <footer>
                <Link to="/">Back to Home</Link>
            </footer>
        </section>
    )

    return content
}
export default Login
