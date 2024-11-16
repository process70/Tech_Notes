import { useState, useEffect } from "react"

const usePersist = () => {
    // the main reason behind using the local storage is to persist the 
    // 'persist' value in case of closing the browser session
    const [persist, setPersist] = useState(JSON.parse(localStorage.getItem('persist')) || false);

    useEffect(() => {
        localStorage.setItem("persist", JSON.stringify(persist))
    }, [persist])

    return [persist, setPersist]
}
export default usePersist