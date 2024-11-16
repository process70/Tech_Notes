import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from './authApiSlice'

const Register = () => {
    const userRef = useRef()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPawword, setConfirmPawword] = useState('')

    const [errMsg, setErrMsg] = useState('')
    const [validUsername, setValidUsername] = useState(false)
    const [validPassword, setValidPassword] = useState(false)
    const [validConfirmPassword, setValidConfirmPassword] = useState(false)

    const USER_REGEX = /^[A-z]{3,20}$/
    const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

    const navigate = useNavigate()

    const [register, { isLoading, isSuccess, isError }] = useRegisterMutation()

    useEffect(() => {
        userRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [username, password])

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])
    
    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password))
    } , [password])

    const errClass = isError ? "errmsg" : "offscreen"
    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''
    const validConfirmPwdClass = password === confirmPawword

    useEffect(() => {
        setValidConfirmPassword(password === confirmPawword)
    } , [password, confirmPawword])

    const canSave = [validUsername, validPassword, validConfirmPassword].every(Boolean)

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePwdInput = (e) => setPassword(e.target.value)
    const handleConfirmPwdInput = (e) => setConfirmPawword(e.target.value)
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        if(canSave){
            try {
                // unwrap allows us to use try-catch block accordingly
                await register({ username, password, confirmPassword: confirmPawword }).unwrap()
                 
            } catch (err) {
                if (!err.status) {
                    setErrMsg('No Server Response');
                } else {
                    setErrMsg(err?.data?.message);
                }                
            }
        }
        else{
            setErrMsg('check your credentials')
        }
    }

    useEffect(() => {
        if(isSuccess){
            console.log('registration success')
            setUsername('')
            setPassword('')
            setConfirmPawword('')
            navigate('/login')
        }   
    }, [isSuccess])

    if (isLoading) return <p>Loading...</p>

    const content = (
        <section className="public">
            <header>
                <h1>Sign Up</h1>
            </header>
            <main className="register">
                <p className={errClass}>{errMsg}</p>

                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="username">
                        Username: [3-20 letters]
                    </label>
                    <input className={`form__input ${validUserClass}`}  type="text" id="username" ref={userRef}
                           value={username} onChange={handleUserInput} autoComplete="off"required />

                    <label htmlFor="password">
                        Password: [4-12 chars incl. !@#$%]
                    </label>
                    <input className={`form__input ${validPwdClass}`} type="password" id="password"
                           onChange={handlePwdInput} value={password} required/>

                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input className={`form__input ${validConfirmPwdClass}`} type="password" id="confirmPassword"
                           onChange={handleConfirmPwdInput} value={confirmPawword} required />
                    {!validConfirmPassword && <small style={{color : 'red', marginTop: '-12px'}}>passwords does not match</small>}

                    <button className="form__submit-button" disabled={!canSave}>Register</button>
                    
                </form>
                <p>Already have an account: <Link to="/login">Login</Link></p>
            </main>
            <footer>
                <Link to="/">Back to Home</Link>
            </footer>
        </section>
    )

    return content
}

export default Register
