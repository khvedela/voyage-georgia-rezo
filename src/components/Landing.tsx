import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import logo from '../assets/logo.svg'

gsap.registerPlugin(ScrollTrigger)

function Landing() {

    const comp: any = useRef();

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(".main-text", { y: "-=360", opacity: 0}, {y: "0", opacity: 1, duration: .5, ease: "ease-in", scrollTrigger: {
                trigger: '.main-text',
                start: 'center bottom',
                end: '-100',
                scrub: 1
            }});
            gsap.fromTo(".logo", { x: "+=360", opacity: 0}, {x: "0", opacity: 1, duration: 1, ease: "ease-in"})
            gsap.fromTo(".learn-more", { x: "+=360", opacity: 0}, {x: "0", opacity: 1, duration: 1, ease: "ease-out", delay: 1.5})
        }, comp)

        return () => ctx.revert();
    }, []);

    return (
        <div className="snap-center flex items-center justify-center h-screen w-screen bg-landing bg-fixed bg-center bg-cover from-indigo-500 backdrop-blur-md" ref={comp}>
            <div className='flex flex-col gap-10'>
                <h1 className="main-text text-8xl antialiased font-bold text-white">Explore Georgia <br /> With Me</h1>
                <button className='learn-more focus:outline-none text-white bg-green-900 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'>Learn more</button>
            </div>
            <img src={logo} className="logo w-1/3 h-1/3 tablet:hidden desktop:block tablet:text-center" />
        </div>
    )
}

export default Landing