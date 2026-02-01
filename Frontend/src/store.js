import { useState } from 'react'

export function useStore(){
    const [user,setUser]=useState(null)
    const [users,setUsers]=useState([])
    const [ops,setOps]=useState([])
    return {user,setUser,users,setUsers,ops,setOps}
}