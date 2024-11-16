import { Outlet, Link } from "react-router-dom"
import { useEffect, useRef, useState } from 'react'
import { useRefreshMutation } from "./authApiSlice"
import { useSelector } from 'react-redux'
import { selectCurrentToken } from "./authSlice"
import usePersist from "../persist/usePersist"

const PersistLogin = () => {

    const [persist] = usePersist()
    const token = useSelector(selectCurrentToken)
    const effectRan = useRef(false)

    const [trueSuccess, setTrueSuccess] = useState(false)

    // isUninitialized refresh token is not being called
    const [refresh, { isUninitialized, isLoading, isSuccess, isError, error}] = useRefreshMutation()

    useEffect(() => {
        // eslint-disable-next-line no-undef
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') { // React 18 Strict Mode
            const verifyRefreshToken = async () => {
                // console.log('verifying refresh token')
                try {
                    //const response = 
                    await refresh()
                    //const { accessToken } = response.data
                    setTrueSuccess(true)
                }
                catch (err) {
                    console.error(err)
                }
            }
            // token == null
            // access token not provided
            // !null return true
            // if there is a token means that the user did ot clode the browser session
            if (!token && persist) verifyRefreshToken()
        }
        // The cleanup function sets effectRan to true.
        // when the component remount the effectRan is still true and the condition above is met
        return () => effectRan.current = true
        // we want that useEffect to be executed once
        // eslint-disable-next-line
    }, [])


    let content
    if (!persist) { // persist: no
        // console.log('no persist')
        content = <Outlet />
    } else if (isLoading) { //persist: yes, token: no
        // console.log('loading')
        content = <p>Loading...</p>
        // if(persist && !isLoading)
    } else if (isError) { //persist: yes, token: no
        // console.log('error')
        content = (
            <p className='errmsg'>
                {error.data?.message}
                <Link to="/login">Please login again</Link>.
            </p>
        )
    } else if (isSuccess && trueSuccess) { //persist: yes, token: yes
        // console.log('success')
        content = <Outlet />
        // the user do not close the browser session or reload the page
    } else if (token && isUninitialized) { //persist: yes, token: yes
        // console.log('token and uninit')
        // console.log(isUninitialized)
        content = <Outlet />
    }

    return content
}
export default PersistLogin