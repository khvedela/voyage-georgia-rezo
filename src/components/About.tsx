import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import rezo from '../assets/rezo.jpg';

gsap.registerPlugin(ScrollTrigger)

function About() {

    const comp: any = useRef();

    useLayoutEffect(() => {
        // let ctx = gsap.context(() => {
        //     gsap.fromTo(".rezoImage", {x: "+100px"}, { x: "-=100px", opacity: 1, duration: .5, ease: "ease-in", scrollTrigger: {
        //         trigger: '.rezoImage',
        //         start: 'top center',
        //         end: '+=100',
        //         scrub: 1
        //     }});
        //
        //     gsap.to(".about-vgr-text", { x: "-=100px", opacity: 1, duration: .5, ease: "ease-in", scrollTrigger: {
        //         trigger: '.about-vgr-text',
        //         start: 'top center',
        //         end: '+=250',
        //         scrub: 2
        //     }});
        // }, comp)

        // return () => ctx.revert();
    }, []);

    return (
        // <div className="h-screen snap-center flex flex-col desktop:flex-row" ref={comp}>
        //     <div className="desktop:h-screen desktop:w-1/3 bg-about bg-fixed bg-cover w-screen h-1/2"></div>
        //     <div className="w-screen flex flex-col justify-center items-center">
        //             <h1 className='text-8xl antialiased font-bold'>About VGR</h1>
        //             <div className="text-area flex flex-row justify-start items-center">
        //                 <img src={rezo} className="rezoImage desktop:w-1/3 tablet:w-1/2 shadow-2xl bg-fixed bg-cover rounded-md" alt="voyage georgia rezo" />
        //                 <div className="about-vgr-text desktop:w-1/2 tablet:w-1/2 p-5 bg-gray-100 shadow-xl rounded-md">
        //                     <p className="desktop:text-3xl tablet:text-xl antialiased text-justify">
        //                         Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed illum
        //                         corporis illo, perspiciatis nisi a. Asperiores est placeat optio eaque,
        //                         at obcaecati <a className="underline decoration-sky-500">perferendisfacere</a> unde expedita. Quas ex expedita labore.
        //                         Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed illum
        //                         corporis illo, perspiciatis nisi a. Asperiores est placeat optio eaque,
        //                         at obcaecati perferendis facere unde expedita. Quas ex expedita labore.
        //                         Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed illum
        //                         corporis illo, perspiciatis nisi a. Asperiores est placeat optio eaque,
        //                         at <a className="underline decoration-indigo-500">obcaecati perferendis</a> facere unde expedita. Quas ex expedita labore.
        //                     </p>
        //                 </div>
        //             </div>
        //     </div>
        // </div>

        <div className='h-screen snap-center flex flex-col box-border' ref={comp}>
            <div className='hidden laptop:block desktop:block desktop:h-screen desktop:w-1/3 laptop:h-screen laptop:w-1/3 laptop:absolute bg-about bg-fixed bg-cover w-screen'></div>
            <div className="w-screen h-screen flex flex-col justify-center items-center z-10 box-border">
                <h1 className="text-6xl antialiased font-bold pb-8 pt-8">About VGR</h1>
                <div className="flex flex-col desktop:flex-row items-center justify-center gap-4">
                    <img src={rezo} className="rezoImage w-80 desktop:w-1/5 shadow-2xl bg-fixed bg-cover rounded-md"/>
                    <p className="w-80 antialiased p-5 bg-gray-300 shadow-xl rounded-md">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed illum
                        corporis illo, perspiciatis nisi a. Asperiores est placeat optio eaque,
                        at obcaecati <a className="underline decoration-sky-500">perferendisfacere</a> unde expedita. Quas ex expedita labore.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed illum
                        corporis illo, perspiciatis nisi a. Asperiores est placeat optio eaque,
                        at obcaecati perferendis facere unde expedita. Quas ex expedita labore.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed illum
                        corporis illo, perspiciatis nisi a. Asperiores est placeat optio eaque,
                        at <a className="underline decoration-indigo-500">obcaecati perferendis</a> facere unde expedita. Quas ex expedita labore.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About
