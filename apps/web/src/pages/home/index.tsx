import './index.css'
// import{ useNavigate } from 'react-router-dom'
import { LoginDialog } from '@/components/auth/LoginDialog'
// import { paths } from '@/routers/paths'
import { useState } from 'react';

export function HomePage() {
    // const navigate = useNavigate()
    const [loginOpen, setLoginOpen] = useState(false);
    return (
        <div className='home-page'>
            {/* <h1 style={{ color: 'white' }}>Home Page</h1> */}
            <div className='circle'></div>
            <div className='circle1'></div>
            <div className='circle2'></div>
            <div className='stave'>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <i className="note n1" />
                <i className="note n2" />
                <i className="note n3" />
                <i className="note n4" />
                <i className="note n5" />
                <div className="chord c1">Bmaj7</div>
                <div className="chord c2">G7</div>
                <div className="chord c3">Cmaj7</div>
                <div className="chord c4">F#7</div>
                <div className="chord c5">Bmaj7</div>
            </div>
            <main className="hero">
                <h1>Syco<i>phone.</i></h1>
                {/* <button onClick={()=> navigate(paths.workshop)}>begin</button> */}
                <button onClick={()=> setLoginOpen(true)}>begin</button>
            </main>
            <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        </div>
    )
}