import React from 'react'


export default function UserList({users}){
    return (
        <div className="users">
            {users.map(u=> (
                <div key={u.userId} style={{color:u.presenceColor}}>
                    ● {u.name}
                </div>
            ))}
        </div>
)
}