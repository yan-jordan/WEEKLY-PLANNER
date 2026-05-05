import Link from 'next/link';


const AboutPage = () => {
    return(
        <>
        <div className="min-h-screen flex">
        <div className="flex flex-col bg-primary h-screen w-64 justify-around items-center  sticky top-0">
                <Link className='text-xl font-bold text-foreground' href="/">Home</Link>
                <Link className=' text-xl font-bold text-foreground' href="/account"> account</Link>
                <Link className=' text-xl font-bold text-foreground' href="/">Subscription</Link>
                <Link className=' text-xl font-bold text-foreground' href="/about">About Us</Link>
                <Link className=' text-xl font-bold text-foreground' href="/login">Login</Link>
                </div>

            <div className="p-20 mt-10 ml-10  w-290 bg-accent height-fix rounded-2xl">
                <h1 className="font-bold text-4xl mb-10 text-background">About US</h1>
                <p className="text-background text-2xl text-left mb-8">
                    Stress usually doesn’t come from having too much to do.<br/>

                    It comes from not knowing when and how to do it.<br/>

                    Tell us the tasks you need to get done.<br/>

                    Add an estimated time, their difficulty, and the time slots you actually have available during your day or week.<br/>

                    We’ll organize everything for you:<br/>

                    we find your free time, arrange your tasks intelligently, and build a realistic                     schedule that you can actually follow.<br/>

                    You only need to focus on one thing:<br/>

                    doing your tasks as well as possible.<br/>

                    Planning, scheduling, and constantly wondering “when should I do this?” — leave                     that to us.<br/>

                    Your mind is meant for more important thinking, not for wrestling with a calendar.<br/>

                    And don’t worry…<br/>

                    we’re not going to schedule a work meeting for you at 3 a.m.<br/>

                    (unless you ask for it!).<br/>
                </p>
                    <Link
                    href="/login"
                    className="block bg-background py-5 px-10 text-center text-foreground font-bold text-xl cursor-pointer duration-300">
                        submit
                    </Link>
            </div>
        </div>
        </>
    )
}

export default AboutPage;