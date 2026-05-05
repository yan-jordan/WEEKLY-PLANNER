import Link from 'next/link';

const LoginPage = () => {
    return(
        <div className="min-h-screen flex justify-center items-center">
            <div className="h-fit bg-accent rounded-2xl p-15 pb-20 w-fit">
                <div className="text-background">
                    <h2 className="mb-20 font-bold text-3xl">login | sign-up</h2>
                </div>
                <div className="flex flex-col">
                    <h2 className="font-bold text-background mb-3 text-2xl">Email:</h2>
                    <input placeholder="Enter your Email" type="text" className="mb-10 bg-accent border-0 border-b-4 border-background   w-100 text-background p-2 text-xl"/>

                    <h2 className="font-bold block text-background mb-3 text-2xl">Password:</h2>
                    <input placeholder="Enter your Password" type="password" className="mb-30 bg-accent border-0 border-b-4 border-background  w-100 text-background p-2 text-xl"/>

                    <Link
                    href="/account"
                    className="block bg-background py-4 px-10 text-center text-foreground font-bold text-xl cursor-pointer">
                        submit
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default LoginPage;