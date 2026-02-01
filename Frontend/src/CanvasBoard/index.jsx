// useRef - store canvas DOM & mutable drawing state
// socket - real-time communication
import React, { useEffect, useRef } from 'react'
import { socket } from '../socket'


export default function CanvasBoard({store}){
    const bgRef = useRef() // background canvas
    const liveRef = useRef()    // live drawing canvas
    const drawing = useRef(false)   // is user currently drawing
    const points = useRef([])   // points of current stroke


    useEffect(()=>{
        const bg = bgRef.current
        const live = liveRef.current
        bg.width = live.width = window.innerWidth
        bg.height = live.height = window.innerHeight


        const ctxBg = bg.getContext('2d')   //permanent
        const ctxLive = live.getContext('2d')   //temporary


        socket.on('stroke', op=> draw(op, ctxBg))
        socket.on('undo', ()=> redraw(ctxBg, store.ops))
        socket.on('redo', ()=> redraw(ctxBg, store.ops))
        socket.on("canvas:update", ops=>{
             store.setOps(ops);
             redraw(ctxBg, ops);
            });

        // Starts a new path for other users
        // Draws line segment by segment
        function draw(op, ctx){
            ctx.strokeStyle = op.color
            ctx.lineWidth = op.width
            ctx.beginPath()
            op.points.forEach((p,i)=>{
                if(i===0) ctx.moveTo(p.x,p.y)
                else ctx.lineTo(p.x,p.y)
            })
            ctx.stroke()
            store.setOps(o=>[...o,op])
        }

        function redraw(ctx, ops){
            ctx.clearRect(0,0,bg.width,bg.height)
            ops.forEach(op=> draw(op, ctx))
        }

        // Final stroke already saved on bg canvas
        live.onmousedown = e=>{
            drawing.current=true
            points.current=[]
            ctxLive.beginPath()
            ctxLive.moveTo(e.clientX,e.clientY)
        }

        live.onmousemove = e=>{
            if(!drawing.current) return
            const p={x:e.clientX,y:e.clientY}
            points.current.push(p)
            ctxLive.lineTo(p.x,p.y)
            ctxLive.stroke()
        }

        live.onmouseup = ()=>{
            drawing.current=false
            if(!store.user) return
            const op={
                opId:crypto.randomUUID(),
                type:'stroke',
                userId:store.user.userId,
                color:store.user.drawingColor,
                width:2,
                points:points.current
            }
            socket.emit('stroke', op)
            ctxLive.clearRect(0,0,live.width,live.height)
        }
    },[store])

    return (
        <>
            <canvas ref={bgRef} className="layer" />
            <canvas ref={liveRef} className="layer" />
        </>
    )
}