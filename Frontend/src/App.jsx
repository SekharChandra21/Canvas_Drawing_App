import React, { useEffect } from 'react'
import { socket } from './socket'
import { useStore } from './store'
import CanvasBoard from './CanvasBoard'
import UserList from './UserList'


export default function App(){
  const store = useStore()


  useEffect(()=>{
    socket.on('self:init', u=>store.setUser(u))
    socket.on('users:update', u=>store.setUsers(u))
    socket.on('canvas:snapshot', ops=>store.setOps(ops))


    return ()=> socket.disconnect()
  },[store])


  return (
    <>
      <UserList users={store.users} />
      <CanvasBoard store={store} />
      <div className="toolbar">
        <button onClick={()=>socket.emit('undo')}>Undo</button>
        <button onClick={()=>socket.emit('redo')}>Redo</button>
      </div>
    </>
  )
}